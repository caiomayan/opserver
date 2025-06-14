/**
 * API Endpoint para configurações do servidor
 * Vercel Serverless Function
 */
export default function handler(req, res) {
  // Configurações SEGURAS (não sensíveis)
  const config = {
    SERVER_IP: process.env.SERVER_IP || '177.54.144.181',
    SERVER_PORT: process.env.SERVER_PORT || '27052',
    UPDATE_INTERVAL: 30000,
    DEBUG_MODE: process.env.NODE_ENV !== 'production',
    // SERVER_NAME e SERVER_REGION são determinados dinamicamente pelo frontend
  };

  // Headers CORS para permitir acesso do frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=300'); // Cache por 5 minutos

  if (req.method === 'GET') {
    res.status(200).json({
      success: true,
      config,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
