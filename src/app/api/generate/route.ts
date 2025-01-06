import { NextResponse } from 'next/server';
import Replicate from "replicate";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    console.log('Received prompt:', prompt);

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    console.log('Starting image generation...');
    const prediction = await replicate.predictions.create({
      version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      input: {
        prompt: prompt,
        negative_prompt: "low quality, bad anatomy, worst quality, low resolution",
        num_outputs: 1,
        scheduler: "K_EULER",
        num_inference_steps: 50,
      }
    });

    // Wait for the prediction to complete
    let result = await replicate.wait(prediction);
    console.log('Replicate result:', result);

    if (!result?.output?.[0]) {
      throw new Error('No image generated');
    }

    return NextResponse.json({ 
      success: true, 
      imageUrl: result.output[0]
    });
  } catch (error) {
    console.error('Detailed error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 