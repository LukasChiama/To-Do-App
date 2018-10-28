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
    const API_KEY = process.env.REACT_APP_API_KEY;
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
    updateItemId: '',
    value: ''
  }

  handleChange = ({ target: { value } }) => this.setState({ value })


  submitItem = (e) => {
    e.preventDefault();
    const { updateItemId, value, items } = this.state;

    if (updateItemId === '') {
      const newItems = [...items, { value, id: UUID(), completed: false }]
      this.setState(({ items: newItems, value: '' }), () => this.updateLocalStorage());
    } else {
      const updatedItems = items.map(x => x.id === updateItemId ? { ...x, value } : x)
      this.setState(({ items: updatedItems, value: '', updateItemId: '' }), () => this.updateLocalStorage());

    }
  }

  updateLocalStorage() {
    localStorage['list'] = JSON.stringify(this.state.items)
  }


  handleOnCheck = (id) => {
    const items = this.state.items.map(x => x.id === id ? { ...x, completed: !x.completed } : x);
    this.setState({ items }, () => this.updateLocalStorage())
  }

  deleteItem = (id) => {
    const items = this.state.items.filter(s => s.id !== id);
    this.setState(({ items }), () => this.updateLocalStorage())
  }

  editItem = (id) => {
    const item = this.state.items.find(x => x.id === id);
    this.setState({ updateItemId: id, value: item.value });
  }

  showToDo = () => {
    return this.state.items.map(item => (
      <div className='unit'
        style={{ textDecoration: item.completed ? 'line-through' : '' }}
        key={item.id}
        id={item.id} >
        <ul>
          <li>
            {item.value}{'  '}
            <input type='checkbox'
              onClick={this.handleOnCheck.bind(this, item.id)} />
          </li>
        </ul>
        <div>
          <Button
            onClick={this.deleteItem.bind(this, item.id)}
            color='danger' size='sm'>Delete
        </Button>{' '}
          <Button
            onClick={this.editItem.bind(this, item.id)}
            color='primary' size='sm'>Edit
        </Button>
        </div>
      </div>
    ))
  }

  render() {
    return (
      <div className='form'>
        <Form onSubmit={this.submitItem}>
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
        {this.showToDo()}
      </div>
    )
  };
}

class App extends React.Component {
  render() {
    return (
      <div className='page'>
        <div className='left'>
          <Greeting />
          <Weather />
        </div>
        <div className='right'>
          <Item />
        </div>
      </div>
    );
  }

}

ReactDOM.render(<App />, document.getElementById('root'));
