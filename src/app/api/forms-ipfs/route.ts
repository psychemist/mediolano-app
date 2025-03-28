import { NextRequest, NextResponse } from "next/server";
import { pinataClient } from "@/utils/pinataClient";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();

    let userObject;

    if (data.has("name") && data.has("description") && data.has("author")) {
      const name = data.get("name") as unknown as string;
      const description = data.get("description") as unknown as string;
      const author = data.get("author") as unknown as string;
      const type = data.get("type") as unknown as string;
      const image = data.get("image") as unknown as string;
      const version = data.get("version") as unknown as string;
      const external_url = data.get("external_url") as unknown as string;

      userObject = {
        name,
        description,
        author,
        type,
        //uploadFile: uploadFile ? uploadFile.name : null,
        image,
        version,
        external_url,
      };
    } else if (
      data.has("title") &&
      data.has("artistName") &&
      data.has("medium")
    ) {
      const title = data.get("title") as string;
      const description = data.get("description") as string;
      const artistName = data.get("artistName") as string;
      const medium = data.get("medium") as string;
      const dimensions = data.get("dimensions") as string;
      const yearCreated = data.get("yearCreated") as string;
      const price = data.get("price") as string;
      const file = data.get("uploadFile") as File | null;

      if (!file) {
        return NextResponse.json(
          { error: "File is required" },
          { status: 400 }
        );
      }

      // Upload file to IPFS
      const fileUploadResponse = await pinataClient.upload.file(file);
      const fileIpfsHash = fileUploadResponse.IpfsHash;

      userObject = {
        title,
        description,
        artistName,
        medium,
        dimensions,
        yearCreated,
        price,
        fileIpfsHash,
      };
    } else {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const uploadData = await pinataClient.upload.json(userObject);
    return NextResponse.json({ uploadData }, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
