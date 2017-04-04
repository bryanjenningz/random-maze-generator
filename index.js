import React, {Component} from 'react';
import {render} from 'react-dom';

class Maze {
  constructor(size) {
    this.size = size;

    // init to all unconnected
    this.tiles = [];
    this.groupSizes = [];
    for (let i = 0; i < size * size; i++) {
      this.tiles[i] = i;
      this.groupSizes[i] = 1;
    }

    // generate a random maze until the start and end are connected
    while (this.root(this.tiles[0]) !== this.root(this.tiles[this.size * this.size - 1])) {
      const i = Math.floor(Math.random() * this.size * this.size);
      const j = Math.floor(Math.random() * this.size * this.size);
      this.union(i, j);
    }

    this.state = {player: 0};
  }

  componentDidMount() {
    addEventListener('keydown', e => {
      switch (e.keyCode) {
        case 37: // left
          this.setState({player: this.state.player - 1});
          break;
        case 38: // up
          this.setState({player: this.state.player - this.size});
          break;
        case 39: // right
          this.setState({player: this.state.player + 1});
          break;
        case 40: // down
          this.setState({player: this.state.player + this.size});
          break;
      }
    });
  }

  componentWillUnmount() {
    removeEventListener('keydown');
  }

  root(i) {
    while (i !== this.tiles[i]) {
      this.tiles[i] = this.tiles[this.tiles[i]]; // path compression
      i = this.tiles[i];
    }
  }

  union(a, b) {
    const rootA = this.root(a);
    const rootB = this.root(b);

    // put the smaller tree group in the larger tree group
    // this keeps the longest possible tree at log(n) because when you
    // combine 2 trees together, the resulting tree can be at most 1 longer,
    // and since we can only combine 2 trees that are sufficiently big enough
    // if the 2 trees are the same size, that means we can only do this 
    // operation log(n) times if there are n values
    if (rootA === rootB) {
      return;
    } else if (this.groupSizes[rootA] < this.groupSizes[rootB]) {
      this.groupSizes[rootB] += this.groupSizes[rootA];
      this.tiles[rootA] = this.tiles[rootB];
    } else {
      this.groupSizes[rootA] += this.groupSizes[rootB];
      this.tiles[rootB] = this.tiles[rootA];
    }
  }

  connected(a, b) {
    return this.root(a) === this.root(b);
  }

  isOpen(i) {
    return this.root(i) === this.tiles[i] && this.groupSizes[i] === 1;
  }

  tileStyle(i) {
    return {
      flex: 1,
      width: 50,
      height: 50,
      border: '1px solid black',
      background: this.state.player === i ? 'cyan' : this.isOpen(i) ? 'white' : 'black'
    };
  }

  render() {
    const matrix = [];
    for (let i = 0; i < this.size; i++) {
      matrix.push([]);
      for (let j = 0; i < this.size; j++) {
        matrix[i].push(this.tiles[this.size * i + j]);
      }
    }
    return (
      <div>
        {matrix.map((row, y) => (
          <div key={y} style={{flexDirection: 'row'}}>
            {matrix[y].map((tile, x) =>
              <div key={x} style={this.tileStyle(y * this.size + x)} />
            )}
          </div>
        ))}
      </div>
    );
  }
}

render(<Maze />, document.querySelector('#root'));
