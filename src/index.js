import React from 'react';
import ReactDOM from 'react-dom';
import UUID from 'uuid/v4';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, FormGroup, Button, Input, Label } from 'reactstrap';
import './index.css';

function Greeting() {
  const time = new Date();
  let name = prompt("Hello, what's your name?");
  let greet;
  if (time.getHours() < 12) {
    greet = "Good Morning!"
  } else if (time.getHours() >= 12 && time.getHours() < 17) {
    greet = "Good Afternoon!"
  } else {
    greet = "Good Evening!"
  }
  return (
    <div className='Greeting'>
      <p>Hello <span className='greet'>{name},</span> {greet}</p>
      <p>What will you be doing today <span className='greet'>{time.toDateString()}</span>?</p>
    </div>
  )
}
const API_KEY = process.env.REACT_APP_API_KEY;
class Weather extends React.Component {
  state = {
    longitude: 0,
    latitude: 0,
    city: '',
    country: '',
    temperature: '',
    humidity: '',
    description: '',
    icon: ''
  }

  getLocation = () => {

  }

  componentDidMount() {
    navigator.geolocation.getCurrentPosition((position) => {
      this.setState({
        longitude: position.coords.longitude,
        latitude: position.coords.latitude,
      })
      fetch('https://api.openweathermap.org/data/2.5/weather?lat=' + this.state.latitude + '&lon=' + this.state.longitude + '&APPID=' + API_KEY)
        .then(response => response.json())
        .then(data => this.setState({
          country: data.sys.country,
          city: data.name,
          temperature: data.main.temp - 273.15,
          humidity: data.main.humidity,
          description: data.weather[0].description,
          icon: 'http://openweathermap.org/img/w/' + data.weather[0].icon + '.png',
        })
        )
    })
  }


  render() {
    return (
      <div className='weather'>
        <div className='summary'>
          <p>The weather today in {this.state.city}, {this.state.country}</p>
          <p>{this.state.temperature}°C <img src={this.state.icon} alt='' className='icon' /></p>
        </div>
        <div>
          <p>Country: <span className='text'>{this.state.country}</span></p>
          <p>City: <span className='text'>{this.state.city}</span></p>
          <p>Temperature: <span className='text'>{this.state.temperature}°C</span></p>
          <p>Humidity: <span className='text'>{this.state.humidity}%</span></p>
          <p>Description: <span className='text'>{this.state.description}</span>
            <img src={this.state.icon} alt='' className='icon' /></p>
        </div>
      </div>
    )
  };
}

class Item extends React.Component {
  state = {
    items: (localStorage['list'] && JSON.parse(localStorage['list'])) || [],
    isChecked: false,
    isId: '',
    value: ''
  }

  handleChange = (e) => {
    this.setState({ value: e.target.value })
  }

  submitItem = (e) => {
    e.preventDefault();
    const isId = this.state.isId;
    if (isId === '') {
      const todo = { value: this.state.value, id: UUID(), style: 'black' };
      this.state.items.push(todo);
      this.setState(({ items: this.state.items }), () => this.updateLocalStorage());
      this.setState({ value: '' });
    } else {
      const updateItem = { value: this.state.value, id: isId, style: 'black' };
      const index = this.state.items.findIndex(a => a.id === isId);
      this.state.items.splice(index, 1, updateItem);
      this.setState(({ items: this.state.items }), () => this.updateLocalStorage());
      this.setState({ value: '' });
      this.setState({ isId: '' });

    }
  }

  updateLocalStorage() {
    localStorage['list'] = JSON.stringify(this.state.items)
  }

  handleCheck = (id) => {
    this.setState({ isChecked: !this.state.isChecked });
    const item = this.state.items.find(t => t.id === id);
    const check = item.style;
    const isChecked = this.state.isChecked;
    console.log(isChecked, check)
    if (!isChecked && check === 'black') {
      item.style = 'blue';
    } else if (isChecked && check === 'black') {
      item.style = 'blue'
    } else {
      item.style = 'black'
    }
  }

  deleteItem = (id) => {
    const items = this.state.items.filter(s => s.id !== id);
    this.setState(({ items }), () => this.updateLocalStorage())
  }

  editItem = (id) => {
    const item = this.state.items.find(x => x.id === id);
    this.setState({ isId: id });
    this.setState({ value: item.value });
  }

  render() {
    const show = this.state.items;
    const showToDo = show.map(item => {
      return (
        <div className='unit'
          style={{ color: item.style }}
          key={item.id}
          id={item.id} >
          <ul>
            <li>
              {item.value}{'  '}
              <input type='checkbox'
                onClick={this.handleCheck.bind(this, item.id)} />
            </li>
          </ul>
          <Button
            onClick={this.deleteItem.bind(this, item.id)}
            color='danger' size='sm'>Delete
          </Button>{' '}
          <Button
            onClick={this.editItem.bind(this, item.id)}
            color='primary' size='sm'>Edit
          </Button>
        </div>
      )
    })
    return (
      <div className='container'>
        <Form onSubmit={this.submitItem} className='unit'>
          <FormGroup>
            <Label for='todo'>To-Do:</Label>
            <Input
              type='text'
              name='todo-item'
              placeholder="You will...?"
              value={this.state.value}
              onChange={this.handleChange} />
          </FormGroup>
          <Button color='success'>Save</Button>
        </Form>
        <div>
          {showToDo}
        </div>
      </div>
    )
  };
}

class App extends React.Component {
  render() {
    return (
      <div className='page'>
        <div className='left'>
          <div><Greeting /></div>
          <div><Weather /></div>
        </div>
        <div className='right'>
          <Item />
        </div>

      </div>
    );
  }

}

ReactDOM.render(<App />, document.getElementById('root'));
