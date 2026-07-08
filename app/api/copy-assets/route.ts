import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const srcMale = 'C:/Users/New/.gemini/antigravity-ide/brain/af905263-ecf1-401c-ae63-a926bf2e011a/advisor_male_1783435989145.png'
    const srcFemale = 'C:/Users/New/.gemini/antigravity-ide/brain/af905263-ecf1-401c-ae63-a926bf2e011a/advisor_female_1783436004791.png'
    
    const publicDir = path.join(process.cwd(), 'public')
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true })
    }
    
    fs.copyFileSync(srcMale, path.join(publicDir, 'advisor_male.png'))
    fs.copyFileSync(srcFemale, path.join(publicDir, 'advisor_female.png'))
    
    return NextResponse.json({ success: true, message: 'Copied successfully!' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message })
  }
}
