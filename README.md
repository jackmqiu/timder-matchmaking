# timder-matchmaking

Provide queue of users for swiping

## Roadmap

View the project roadmap [here](https://drive.google.com/open?id=1kAPJHYxOglYTeN3WJslR1_gGNFUneNer6oveAjPyoFA)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

# Table of Contents

1. [Usage](#Usage)
1. [API Usage](#api-usage)
    1. [Input](#input)
    1. [Output](#output)
1. [Requirements](#requirements)
1. [Development](#development)
    1. [Installing Dependencies](#installing-dependencies)
    1. [Tasks](#tasks)

## Usage

### API Usage

#### Input

Request will happen with one of two unique keys

```javascript
{
  user_id: STRING,
  location: STRING
}
```

- `user_id` Current swiping __user__. Request made when queue on client side depleted.
- `location` Current swiping user's __zone string__.

##### Example Queue Request Parameters

Get new swipe queue for user with ID _#7443_ and location _"Zone A"_
```javascript
{
  user_id: 7743,
  location: 'A'
}
```

#### Output

```javascript
[
  {
    user_id: INT,
    name: STRING,
    photoCount: NUMBER,
    location: STRING,
  }...
]
```

The return user objects have been built to include information irrelevant to the MVP, for future expansion opportunity

- `name` The user's name
- `photoCount` The user's photoCount. The only factor distinguishing one user from the next in queue in this simulation
- `location` Which zone the user is located in

## Requirements

- Node 6.9.x
- Postgresql 9.6.x
- express 4.16.2
- faker 4.1.0
- mocha 4.0.1
- chai 4.1.2
- pg 7.3.0
- pg-hstore 2.3.2
- sequelize 5.15.0

## Development
### Installing Dependencies
Run `npm install`

### Tasks

#### Simulation

- Simulate user logins
- Simulate user swipes
- Simulate user logouts

#### Monitoring/Testing

- Time for queues to form
- Space for queues saved
- Time for hashes gathered
- Errors logged out into log directory


## Other Information

### Schema

__Queues__

Redis Lists

__Users__

Redis Hash

__Swipes__

Redis Set
