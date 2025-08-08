import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'teams.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const teams = JSON.parse(fileContents);
    
    return Response.json(teams);
  } catch (error) {
    console.error('Erro ao ler teams.json:', error);
    return Response.json([], { status: 500 });
  }
}
