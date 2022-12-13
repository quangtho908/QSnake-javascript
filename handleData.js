export default function handleData(){
  return {
    readData() {
      
      return JSON.parse(localStorage.getItem("data")) || {};
    },

    saveData(snake) {
      localStorage.setItem("data" ,JSON.stringify(snake.table))
      localStorage.setItem("esp", snake.esp)
    }
  }
}