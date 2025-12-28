#!/bin/bash
# Script para iniciar el backend FastAPI

echo "🚀 Iniciando FinanzasApp Backend..."
echo "📁 Directorio: $(pwd)"
echo "🐍 Python: $(python --version)"
echo ""

# Activar entorno virtual
source venv/bin/activate

# Cambiar al directorio padre para que funcionen los imports relativos
cd ..

# Iniciar FastAPI con uvicorn
echo "▶️  Iniciando servidor en http://localhost:8000"
echo "📚 Documentación: http://localhost:8000/docs"
echo ""
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
