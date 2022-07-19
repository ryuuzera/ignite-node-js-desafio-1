function getDateDia(){
  const DataHora = []
  DataHora.push(new Date().toLocaleDateString("pt-BR"));
  DataHora.push(new Date().toLocaleTimeString("pt-BR"));
  
  return DataHora;
}

module.exports = { getDateDia };