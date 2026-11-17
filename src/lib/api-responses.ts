import { NextResponse } from "next/server";

// Error responses for API route handlers. Every route builds its error
// responses through these so the JSON shape ({ error }) stays consistent.

export function badRequest(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function forbidden(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function notFound(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 404 });
}
