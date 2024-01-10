import React from 'react'
import './App.css'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      todoList: [],
      activeItem:{
        id: null,
        title: '',
        completed:false,
      },
      editting: false,
    }
    this.fetchTasks = this.fetchTasks.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handeSubmit = this.handeSubmit.bind(this);
    this.getCookie = this.getCookie.bind(this);
    this.startEdit = this.startEdit.bind(this);
    this.deleteItem =this.deleteItem.bind(this);
    this.strikeUnstrike= this.strikeUnstrike.bind(this);
  };

  getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
  }

  componentWillMount(){
    this.fetchTasks();
  };
  fetchTasks(){
    console.log('Fetching ...')

    fetch('http://127.0.0.1:8000/api/task-list/')
    .then(response => response.json())
    .then(data =>{
      this.setState({
        todoList: data
      })
     })

  
  }
  handleChange(e) {
    var name = e.target.name
    var value = e.target.value
    console.log('Name: ', name)
    console.log('Value: ', value)

    this.setState({
      activeItem:{
        ...this.state.activeItem,
        title: value,
      }
    })
  }
  handeSubmit(e){
    e.preventDefault()
    console.log('ITEM: ',this.state.activeItem)

    var csrftoken = this.getCookie('csrftoken')

    var url ="http://127.0.0.1:8000/api/task-create/"

    if(this.state.editing == true){
      url = `http://127.0.0.1:8000/api/task-update/${ this.state.activeItem.id}/`
      this.setState({
        editing:false
      })
    }

 

    fetch(url,{
      method: 'POST',
      headers:{
        'Content-Type': 'application/json',
        'X-CSRFToken':csrftoken,
      },
      body: JSON.stringify(this.state.activeItem)
    }).then((response) => {
      this.fetchTasks()
      this.setState({
        activeItem:{
          id: 0,
          title: '',
          completes:false,
        }
      })
    }).catch(function(error){
      console.log('Error: ',error)
    })
  }

  startEdit(task){
    this.setState({
      activeItem:task,
      editting:true,
    })
  }


  deleteItem(task){
    var csrftoken = this.getCookie('csrftoken')

  
    fetch(`http://127.0.0.1:8000/api/task-delete/${task.id}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken':csrftoken,
      },
    }).then((response) => {
      this.fetchTasks()
    })
  }

  strikeUnstrike(task){
    task.completed = !task.completed
    console.log("strike :", task.completed)

    var csrftoken = this.getCookie('csrftoken')
    var url =  `http://127.0.0.1:8000/api/task-update/${ task.id}/`

    fetch(url,{
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'X-CSRFToken': csrftoken,
      },
      body: JSON.stringify({'completed': task.completed, 'title': task.title})
    }).then((response)=>this.fetchTasks())


  }
  render() {
  
  var tasks = this.state.todoList;
  var self = this;
  return (
    <div className=" h-[120vh] bg-gradient-to-r from-cyan-400 via-cyan-800 to-teal-700 flex justify-center items-start">
      <div id='task-container ' className='  bg-white mt-16  ' >
        <div className='justify-center items-center' id='form-wrapper'>
        <form onSubmit={this.handeSubmit}  id="form">
          <div className="inline-flex">
              <div className='flex justify-center' >
                <input
                onChange={this.handleChange}
                id='title'
                name='title'
                type="text"
                value={this.state.activeItem.title}
                placeholder='Add Task'
                className=" w-96  h-8 mb-6 mt-8 ml-5 mr border border-slate-900 ring-0 ring-gray-300 focus:ring-gray-400 focus:ring-1 rounded-l-xl px-6 text-center "
                />
                  
                </div>

                <div className='flex justify-center'>
                <input id="submit" className=" w-28 h-8 mt-8 border-none ring-1 ring-slate-500 bg-red-600 cursor-pointer rounded-r-xl mr-5 " type="submit" name="Add" />
                </div>
            </div>
        </form>
        </div>
        <div id='list-wrapper'>
          {tasks.map(function(task, index) {
            return(
              <div key={index} className=' flex cursor-pointer text-[#686868] m-2 p-3 border-b border-solid hover:bg-slate-200'>
                 <div onClick={()=> self.strikeUnstrike(task)} style={{flex:7}}>
                 
                 {task.completed == false ? (
                  <span>{task.title}</span>
                 ):(
                  <del>{task.title}</del>
                 )}
                  
                </div>
                <div style={{flex:1}}>
                  <button onClick={()=> self.startEdit(task)} className='border border-blue-800 px-2 text-blue-800 rounded-md hover:bg-cyan-600 hover:text-black' >EDIT</button>
                </div>
                <div style={{flex:1}}>
                  <button onClick={() => {self.deleteItem(task)}} className='border border-red-600 px-2 text-red-600 rounded-md hover:bg-red-600 hover:text-black'>DELETE</button>
                </div>

              </div>
            )
          })}

        </div>
      </div>
    </div>
  )
  }
}

export default App;