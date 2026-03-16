update node.js 24
pnpm.cmd install
run be: pnpm.cmd --filter @workspace/api-server dev
run fe: $env:PORT='5173'; $env:BASE_PATH='/'; pnpm.cmd --filter @workspace/smart-food-tour dev
