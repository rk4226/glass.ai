import { NextResponse } from 'next/server';
import Replicate from "replicate";
import { writeFile } from "node:fs/promises";
import { join } from 'path';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          prompt: prompt,
          negative_prompt: "low quality, bad anatomy, worst quality, low resolution",
        }
      }
    ) as string[];

    // Fetch the image from the URL
    const imageUrl = output[0];
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();

    // Generate unique filename using timestamp
    const timestamp = Date.now();
    const filename = `generated-image-${timestamp}.png`;
    
    // Save the image locally with unique filename
    const imagePath = join(process.cwd(), 'public', filename);
    await writeFile(imagePath, Buffer.from(imageBuffer));

    return NextResponse.json({ 
      success: true, 
      imagePath: `/${filename}`,
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
} 