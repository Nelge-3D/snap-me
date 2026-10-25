import { renderAppIcon } from "@/lib/pwaIcon";

export function GET() {
  return renderAppIcon(512);
}
