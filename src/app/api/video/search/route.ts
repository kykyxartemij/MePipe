import { NextRequest } from "next/server";
import { getSearchSuggestions } from "@/services/video.service";

export async function GET(request: NextRequest) {
  return getSearchSuggestions(request);
}
