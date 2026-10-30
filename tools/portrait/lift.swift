import Foundation
import Vision
import CoreImage
import CoreImage.CIFilterBuiltins
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
let input = URL(fileURLWithPath: args[1]), output = URL(fileURLWithPath: args[2])
let px = Double(args[3])!, py = Double(args[4])!   // pick point in pixels, top-left origin

let handler = VNImageRequestHandler(url: input)
let request = VNGenerateForegroundInstanceMaskRequest()
try handler.perform([request])
guard let obs = request.results?.first else { print("no subject found"); exit(1) }

let mask = obs.instanceMask
CVPixelBufferLockBaseAddress(mask, .readOnly)
let w = CVPixelBufferGetWidth(mask), h = CVPixelBufferGetHeight(mask)
let base = CVPixelBufferGetBaseAddress(mask)!.assumingMemoryBound(to: UInt8.self)
let row = CVPixelBufferGetBytesPerRow(mask)
let src = CIImage(contentsOf: input)!
let sx = Int(px / src.extent.width * Double(w)), sy = Int(py / src.extent.height * Double(h))
let label = Int(base[sy * row + sx])
var counts = [Int: Int]()
for y in 0..<h { for x in 0..<w { counts[Int(base[y * row + x]), default: 0] += 1 } }
CVPixelBufferUnlockBaseAddress(mask, .readOnly)
print("instances:", obs.allInstances.sorted(), "label at point:", label, "pixel counts:", counts.sorted { $0.key < $1.key })
guard label != 0 else { print("point is background"); exit(2) }

let masked = try obs.generateMaskedImage(ofInstances: IndexSet(integer: label), from: handler, croppedToInstancesExtent: false)
let ci = CIImage(cvPixelBuffer: masked)
let ctx = CIContext()
try ctx.writePNGRepresentation(of: ci, to: output, format: .RGBA8, colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!)
print("wrote", output.path, ci.extent)
