import imageio
import os

input_file = r"C:\Users\of\.gemini\antigravity\brain\278063ef-64f5-423d-a73c-fc97e2bfb633\drsp_patient_c_test_1778093676660.webp"
output_file = r"C:\Projects\Prob_Project\drsp_patient_c_test.mp4"

print("Reading WEBP...")
reader = imageio.get_reader(input_file)

# Attempt to get fps, default to 10 if unavailable
meta = reader.get_meta_data()
fps = meta.get('fps', 10) 
if fps == 0:
    fps = 10

print(f"Writing MP4 at {fps} FPS...")
writer = imageio.get_writer(output_file, fps=fps, codec='libx264')

frame_count = 0
for frame in reader:
    writer.append_data(frame)
    frame_count += 1

writer.close()
print(f"Conversion successful! {frame_count} frames saved to {output_file}")
