#!/bin/bash

echo "?? Diagnóstico del Proyecto Siberiano"
echo "=================================="
echo ""

echo "?? Estructura del Proyecto:"
ls -la

echo ""
echo "?? Verificando puertos:"
echo "- Verificando puerto 3001 (API)..."
curl -s http://localhost:3001/api/health || echo "? API no responde en puerto 3001"

echo ""
echo "- Verificando puerto 5173 (Frontend Vite)..."
curl -s http://localhost:5173 || echo "??  Frontend no responde en puerto 5173"

echo ""
echo "?? Verificando dependencias instaladas:"
echo "Frontend:"
cd web && npm list --depth=0 | head -20
echo ""
echo "Backend:"
cd ../api && npm list --depth=0 | head -20

echo ""
echo "? Diagnóstico completado"
