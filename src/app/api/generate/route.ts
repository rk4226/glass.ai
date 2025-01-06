import { NextResponse } from 'next/server';
import Replicate from "replicate";

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

    // Return the image URL directly
    return NextResponse.json({ 
      success: true, 
      imageUrl: output[0]  // Replicate returns the URL in output[0]
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
} 