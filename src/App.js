import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Container, Form, Row, Col, Card, Nav, Table } from 'react-bootstrap';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function App() {
  const [monopolyBalance, setMonopolyBalance] = useState(200);
  const [cryptoBalance, setCryptoBalance] = useState(0);
  const [monocoinPrice, setMonocoinPrice] = useState(100);
  const [amount, setAmount] = useState('');
  const [events, setEvents] = useState([]);
  const [priceModifier, setPriceModifier] = useState(0);
  const [priceHistory, setPriceHistory] = useState([]);
  const [forecastAmount, setForecastAmount] = useState('');
  const [forecastDirection, setForecastDirection] = useState('rise');
  const [activeForecast, setActiveForecast] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      axios.get('http://localhost:4000/price')
        .then(response => {
          const basePrice = response.data.price;
          const modifiedPrice = Math.round(basePrice * (1 + priceModifier / 100));
          setMonocoinPrice(modifiedPrice);
          setPriceHistory(prevHistory => [...prevHistory, { time: new Date(), price: modifiedPrice }]);
        })
        .catch(error => {
          console.error('Error fetching price:', error);
        });
    }, 5000);

    return () => clearInterval(interval);
  }, [priceModifier]);

  useEffect(() => {
    if (activeForecast) {
      const timer = setTimeout(() => {
        const isCorrect = (forecastDirection === 'rise' && monocoinPrice > activeForecast.price) ||
                          (forecastDirection === 'fall' && monocoinPrice < activeForecast.price);
        if (isCorrect) {
          const profit = forecastAmount * 3;
          setCryptoBalance(c => c + profit);
          addEvent(`Forecast was correct! Gained ${profit} Monocoins`);
        } else {
          setCryptoBalance(c => c - forecastAmount);
          addEvent(`Forecast was incorrect. Lost ${forecastAmount} Monocoins`);
        }
        setActiveForecast(null);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [activeForecast, monocoinPrice, forecastAmount, forecastDirection]);

  const handleBuy = () => {
    if (amount > 0) {
      const totalCost = amount * monocoinPrice;
      if (totalCost <= monopolyBalance) {
        setMonopolyBalance(m => m - totalCost);
        setCryptoBalance(parseFloat(cryptoBalance) + parseFloat(amount));
        addEvent(`Bought ${amount} Monocoins for $${totalCost}`);
      } else {
        alert('Not enough cash to complete the purchase.');
      }
    }
  };

  const handleSell = () => {
    if (amount > 0 && amount <= cryptoBalance) {
      const totalValue = amount * monocoinPrice;
      setCryptoBalance(parseFloat(cryptoBalance) - parseFloat(amount));
      setMonopolyBalance(m => m + totalValue);
      addEvent(`Sold ${amount} Monocoins for $${totalValue}`);
    } else {
      alert('Not enough Monocoins to complete the sale.');
    }
  };

  const handleAddFunds = () => {
    if (amount > 0) {
      setMonopolyBalance(m => m + parseFloat(amount));
      addEvent(`Added $${amount} to cash balance`);
    }
  };

  const handleWithdrawFunds = () => {
    if (amount > 0 && amount <= monopolyBalance) {
      setMonopolyBalance(m => m - parseFloat(amount));
      addEvent(`Withdrew $${amount} from cash balance`);
    } else {
      alert('Not enough cash to complete the withdrawal.');
    }
  };

  const rollDice = () => {
    const diceRoll = Math.floor(Math.random() * 6) + 1;
    if (diceRoll >= 1 && diceRoll <= 3) {
      setPriceModifier(prevModifier => prevModifier - 10);
      addEvent(`Rolled ${diceRoll}: Monocoin price decreased by 10%`);
    } else if (diceRoll >= 4 && diceRoll <= 6) {
      setPriceModifier(prevModifier => prevModifier + 10);
      addEvent(`Rolled ${diceRoll}: Monocoin price increased by 10%`);
    }
  };

  const applyNewRegulation = () => {
    const randomValue = Math.random();
    if (randomValue > 0.5) {
      setPriceModifier(prevModifier => prevModifier + 15);
      addEvent('New Regulation: Monocoin price increased by 15%');
    } else {
      setPriceModifier(prevModifier => prevModifier - 15);
      addEvent('New Regulation: Monocoin price decreased by 15%');
    }
  };

  const hackerAttack = () => {
    setPriceModifier(prevModifier => prevModifier - 20);
    addEvent('Hacker Attack: Monocoin price decreased by 20%');
  };

  const techUpgrade = () => {
    setPriceModifier(prevModifier => prevModifier + 10);
    addEvent('Tech Upgrade: Monocoin price increased by 10%');
  };

  const handleForecast = () => {
    if (forecastAmount > 0 && forecastAmount <= cryptoBalance) {
      setActiveForecast({ price: monocoinPrice, amount: forecastAmount, direction: forecastDirection });
      setCryptoBalance(c => c - forecastAmount);
      addEvent(`Forecast placed: ${forecastDirection} with ${forecastAmount} Monocoins`);
    } else {
      alert('Invalid forecast amount.');
    }
  };

  const addEvent = (eventDescription) => {
    setEvents(prevEvents => [...prevEvents, { id: prevEvents.length + 1, description: eventDescription }]);
  };

  return (
    <Router>
      <Container className="mt-5">
        <Nav variant="tabs" defaultActiveKey="/">
          <Nav.Item>
            <Nav.Link as={Link} to="/">Dashboard</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link as={Link} to="/price-history">Price History</Nav.Link>
          </Nav.Item>
        </Nav>
        <Routes>
          <Route exact path="/" element={
            <>
              {/* Dashboard Content */}
              <Row className="justify-content-md-center">
                <Col md="6">
                  <Card className="mb-4">
                    <Card.Body>
                      <Card.Title>MonoCoin Dashboard</Card.Title>
                      <Card.Text>
                        <p>Current Price: ${monocoinPrice}</p>
                        <p>Cash: ${monopolyBalance}</p>
                        <p>Crypto: {parseFloat(cryptoBalance).toFixed(2)} MonoCoins</p>
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              <Row className="justify-content-md-center">
                <Col md="6">
                  <Card className="mb-4">
                    <Card.Body>
                      <Card.Title>Trade MonoCoin</Card.Title>
                      <Form>
                        <Form.Group controlId="formAmount">
                          <Form.Label>Amount</Form.Label>
                          <Form.Control
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value.replace(/^0+(?!$)/, ''))}
                            min="0"
                          />
                        </Form.Group>
                        <div className="mt-3">
                          <Button variant="primary" onClick={handleBuy}>Buy</Button>{' '}
                          <Button variant="secondary" onClick={handleSell}>Sell</Button>{' '}
                          <Button variant="success" onClick={handleAddFunds}>Add Funds</Button>{' '}
                          <Button variant="danger" onClick={handleWithdrawFunds}>Withdraw Funds</Button>
                        </div>
                      </Form>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              <Row className="justify-content-md-center">
                <Col md="6">
                  <Card className="mb-4">
                    <Card.Body>
                      <Card.Title>Forecast Price Movement</Card.Title>
                      <Form>
                        <Form.Group controlId="formForecastAmount">
                          <Form.Label>Amount to Bet</Form.Label>
                          <Form.Control
                            type="number"
                            value={forecastAmount}
                            onChange={(e) => setForecastAmount(e.target.value.replace(/^0+(?!$)/, ''))}
                            min="0"
                          />
                        </Form.Group>
                        <Form.Group controlId="formForecastDirection" className="mt-3">
                          <Form.Label>Direction</Form.Label>
                          <Form.Control as="select" value={forecastDirection} onChange={(e) => setForecastDirection(e.target.value)}>
                            <option value="rise">Rise</option>
                            <option value="fall">Fall</option>
                          </Form.Control>
                        </Form.Group>
                        <div className="mt-3">
                          <Button variant="primary" onClick={handleForecast}>Place Forecast</Button>
                        </div>
                      </Form>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              <Row className="justify-content-md-center">
                <Col md="6">
                  <Card className="mb-4">
                    <Card.Body>
                      <Card.Title>Events</Card.Title>
                      <div className="mt-3">
                        <Button variant="warning" onClick={rollDice}>Roll Dice</Button>{' '}
                        <Button variant="info" onClick={applyNewRegulation}>Apply New Regulation</Button>{' '}
                        <Button variant="danger" onClick={hackerAttack}>Hacker Attack</Button>{' '}
                        <Button variant="success" onClick={techUpgrade}>Tech Upgrade</Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              <Row className="justify-content-md-center">
                <Col md="8">
                  <Card className="mb-4">
                    <Card.Body>
                      <Card.Title>Event Log</Card.Title>
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {events.map(event => (
                            <tr key={event.id}>
                              <td>{event.id}</td>
                              <td>{event.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          } />
          <Route path="/price-history" element={
            <>
              {/* Price History Content */}
              <Row className="justify-content-md-center">
                <Col md="8">
                  <Card className="mb-4">
                    <Card.Body>
                      <Card.Title>Monocoin Price History</Card.Title>
                      <Line
                        data={{
                          labels: priceHistory.map(entry => entry.time.toLocaleTimeString()),
                          datasets: [{
                            label: 'Monocoin Price',
                            data: priceHistory.map(entry => entry.price),
                            fill: false,
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1
                          }]
                        }}
                      />
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          } />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;