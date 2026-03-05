import { NextRequest } from "next/server";
import { getSuggestions } from "@/services/video.service";

export async function GET(request: NextRequest) {
  return getSuggestions(request);
}
