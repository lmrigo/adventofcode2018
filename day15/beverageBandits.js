var input = [
`#######
#.E...#
#.....#
#...G.#
#######`,
`#######
#E..G.#
#...#.#
#.G.#G#
#######`,
`#########
#G..G..G#
#.......#
#.......#
#G..E..G#
#.......#
#.......#
#G..G..G#
#########`,
`#######
#.G...#
#...EG#
#.#.#G#
#..G#E#
#.....#
#######`, // 27730
// `#######
// #..G..#
// #...G.#
// #.#G#G#
// #...#E#
// #.....#
// #######`,
`#######
#G..#E#
#E#E.E#
#G.##.#
#...#E#
#...E.#
#######`, // 36334
`#######
#E..EG#
#.#G.E#
#E.##E#
#G..#.#
#..E#.#
#######`, // 39514
`#######
#E.G#.#
#.#G..#
#G.#.G#
#G..#.#
#...E.#
#######`, // 27755
`#######
#.E...#
#.#..G#
#.###.#
#E#G#G#
#...#G#
#######`, // 28944
`#########
#G......#
#.E.#...#
#..##..G#
#...##..#
#...#...#
#.G...G.#
#.....G.#
#########`, // 18740
`###########
#G..#....G#
###..E#####
###########`, // 10804
 puzzleInput
]

var grid = []

var day15 = function() {

  // for (var i = 0; i < input.length; i++) {
  // for (var i = 2; i < 3; i++) {
  // for (var i = 3; i < input.length-1; i++) {
  // for (var i = 8; i < input.length-2; i++) {
  // for (var i = 9; i < input.length-1; i++) {
  for (var i = 10; i < input.length; i++) {
    var lines = input[i].split(/\n+/)
    grid = []
    var units = []
    for (var gx = 0; gx < lines.length; gx++) {
      grid[gx] = []
      var cells = lines[gx].split('')
      for (var gy = 0; gy < cells.length; gy++) {
        grid[gx][gy] = cells[gy]
        if ('GE'.includes(cells[gy])) {
          units.push({
            'x': gx,
            'y': gy,
            'type': cells[gy],
            'attack': 3,
            'hp': 200
          })
        }
      }
    }
    // console.log(grid)

    var queue = []
    queue.push(...units)
    var limit = 1000
    var round = 0
    while (round++ < limit && queue.length > 0) {
      // console.log(queue)
      queue.sort((a,b) => {
        return (a.x - b.x) !== 0 ? (a.x - b.x) : (a.y - b.y)
      })
      var remaining = []
      while (queue.length > 0) {
        // check if game has ended
        var gobs = units.reduce((acc, val) => {
          return acc + (val.type === 'G')
        }, 0)
        var elves = units.reduce((acc, val) => {
          return acc + (val.type === 'E')
        }, 0)
        if (gobs === 0 || elves === 0) {
          // game over
          round-=2 // not a full round
          queue = [] // clear the queue
          remaining = []
          // it will still do another round with an empty queue then finish
          break
        }
        // play the unit
        var u = queue.shift()
        if (!canAttack(u)) { // move
          // find possible moves
          var neighbours = []
          if (grid[u.x+1][u.y] === '.') { neighbours.push({x: u.x+1, y: u.y}) }
          if (grid[u.x-1][u.y] === '.') { neighbours.push({x: u.x-1, y: u.y}) }
          if (grid[u.x][u.y+1] === '.') { neighbours.push({x: u.x, y: u.y+1}) }
          if (grid[u.x][u.y-1] === '.') { neighbours.push({x: u.x, y: u.y-1}) }
          if (neighbours.length === 0) {
            // can't move
            remaining.push(u)
            continue
          }
          // find targets
          var targets = units.filter((other) => {
            return other.type !== u.type
          })
          if (targets.length === 0) {
            // finished
            break
          }
          targets.sort((a,b) => { // put the closer ones first
            var atou = (Math.abs(a.x - u.x) + Math.abs(a.y - u.y))
            var btou = (Math.abs(b.x - u.x) + Math.abs(b.y - u.y))
            return atou - btou
          })
          // find targets in range
          var inRange = []
          $.each(targets, (tidx, t) => {
            if (grid[t.x+1][t.y] === '.') { inRange.push({x: t.x+1, y: t.y}) }
            if (grid[t.x-1][t.y] === '.') { inRange.push({x: t.x-1, y: t.y}) }
            if (grid[t.x][t.y+1] === '.') { inRange.push({x: t.x, y: t.y+1}) }
            if (grid[t.x][t.y-1] === '.') { inRange.push({x: t.x, y: t.y-1}) }
          })
          inRange.sort((a,b) => { // put the closer ones first
            var atou = (Math.abs(a.x - u.x) + Math.abs(a.y - u.y))
            var btou = (Math.abs(b.x - u.x) + Math.abs(b.y - u.y))
            if (atou - btou !== 0) {
              return atou - btou
            } else { // if it's the same distance, order by grid position
              return (a.x - b.x) !== 0 ? (a.x - b.x) : (a.y - b.y)
            }
          })
          // filter by those that are reachable
          // by calculating the distance to it
          var nearStates = []
          $.each(inRange, (ridx, r) => {
            var shortestPath = 100 // 246 open spaces
            var initialState = {'x': r.x, 'y':r.y, 'steps': 0, 'trace': ':'+r.x+','+r.y}
            var history = []
            var nextStates = [initialState]
            var timeout = 100000
            while (nextStates.length > 0 && --timeout) {
              if (timeout % 50000 === 0) {
                console.log(shortestPath, nextStates.length)
              }
              var state = nextStates.shift()
              // var state = nextStates.pop()
              if (history[state.x] === undefined) { history[state.x] = [] }
              if (history[state.x][state.y] === undefined) {
                history[state.x][state.y] = state.steps
              } else if (history[state.x][state.y] <= state.steps) { // drop paths longer than history TODO TEST <=
                continue
              } else {
                history[state.x][state.y] = state.steps
              }
              var match = neighbours.find((n) => {
                return n.x === state.x && n.y === state.y
              })
              if (match) {
                shortestPath = state.steps < shortestPath ? state.steps : shortestPath
                if (nearStates.find((n) => {
                    return n.x === state.x && n.y === state.y && n.steps === state.steps && n.trace === state.trace
                  }) === undefined) { // avoid duplicates
                  nearStates.push(state)
                }
              } else {
                //generate next states
                var genMoves = []
                $.each(generateMoves(state), function(idx, gm) {
                  if (gm.steps <= shortestPath) { // include only paths shorter or equal than already found
                    if (history[gm.x] && history[gm.x][gm.y] && history[gm.x][gm.y] <= gm.steps) { // drop paths longer than history TODO TEST <=
                      return true
                    }
                    if (nextStates.find((other) => { // don't add repeated states. or at least repeated that have more steps
                      return gm.x === other.x && gm.y === other.y && gm.steps > other.steps
                    }) >= 0) { return true }
                    // compare the current shortest path to the generated move
                    var remSteps = shortestPath - gm.steps
                    var currentToDest = (Math.abs(u.x - gm.x) + Math.abs(u.y - gm.y))
                    if (currentToDest <= remSteps+1) { // only add if there is a way to be shorter (straight path)
                      genMoves.push(gm)
                    }
                  }
                })
                genMoves.sort((a,b) => { // put the closer ones first
                  var atou = (Math.abs(a.x - u.x) + Math.abs(a.y - u.y))
                  var btou = (Math.abs(b.x - u.x) + Math.abs(b.y - u.y))
                  return atou - btou
                })
                nextStates.push(...genMoves)
              }
            }
            if (!timeout) {
              console.log('timeout!')
            }
          })

          // Nearest
          if (nearStates.length === 0) {
            // no path found. stand still
            remaining.push(u)
            continue
          }
          nearStates.sort((a,b) => {
            if (a.steps - b.steps !== 0) {
              return a.steps - b.steps
            } else {
              var srcA = $.map(a.trace.split(':')[1].split(','), (n)=>{return Number(n)})
              var srcB = $.map(b.trace.split(':')[1].split(','), (n)=>{return Number(n)})
              if (srcA[0] === srcB[0]) {
                if (srcA[1] === srcB[1]) {
                  return (a.x - b.x) !== 0 ? (a.x - b.x) : (a.y - b.y)
                } else {
                  return srcA[1] - srcB[1]
                }
              } else {
                return srcA[0] - srcB[0]
              }
            }
          })
          // Chosen
          var nearest = nearStates[0]

          if ((Math.abs(u.x - nearest.x) + Math.abs(u.y - nearest.y)) !== 1) {
            console.log('pediu pra parar parou')
          }
          // get model index
          var uidx = units.findIndex((m) => {
            return m.x === u.x && m.y === u.y
          })
          // effectively move on grid
          grid[u.x][u.y] = '.'
          u.x = nearest.x
          u.y = nearest.y
          grid[u.x][u.y] = u.type
          remaining.push(u)
          // update model
          units[uidx].x = u.x
          units[uidx].y = u.y
        } // end move

        if (canAttack(u)) { // might be able to attack after has moved
          var targets = []
          if ('GE'.includes(grid[u.x+1][u.y]) && grid[u.x+1][u.y] !== u.type) { // up
            targets.push(units.find((t) => {
              return (t.x === u.x+1) && (t.y === u.y) && (t.type !== u.type)
            }))
          }
          if ('GE'.includes(grid[u.x-1][u.y]) && grid[u.x-1][u.y] !== u.type) { // down
            targets.push(units.find((t) => {
              return (t.x === u.x-1) && (t.y === u.y) && (t.type !== u.type)
            }))
          }
          if ('GE'.includes(grid[u.x][u.y+1]) && grid[u.x][u.y+1] !== u.type) { // right
            targets.push(units.find((t) => {
              return (t.x === u.x) && (t.y === u.y+1) && (t.type !== u.type)
            }))
          }
          if ('GE'.includes(grid[u.x][u.y-1]) && grid[u.x][u.y-1] !== u.type) { // left
            targets.push(units.find((t) => {
              return (t.x === u.x) && (t.y === u.y-1) && (t.type !== u.type)
            }))
          }
          // sort targets by hp,x,y
          targets.sort((a,b) => {
            if (a.hp - b.hp !== 0) {
              return a.hp - b.hp
            } else {
              return (a.x - b.x) !== 0 ? (a.x - b.x) : (a.y - b.y)
            }
          })
          // find target in arrays
          var atk = targets[0]
          var atkIdx = units.findIndex((a) => {
            return atk.x === a.x && atk.y === a.y
          })
          if (atkIdx >= 0) {
            // subtract u.attack from target.hp
            units[atkIdx].hp -= u.attack
            // if target.hp <= 0 then remove from units and grid
            if (units[atkIdx].hp <= 0) {
              grid[units[atkIdx].x][units[atkIdx].y] = '.'
              units.splice(atkIdx,1)
              // remove unit from queue/remaining too
              var qidx = queue.findIndex((a) => {
                return atk.x === a.x && atk.y === a.y
              })
              if (qidx >= 0) {
                queue.splice(qidx,1)
              }
              var ridx = remaining.findIndex((a) => {
                return atk.x === a.x && atk.y === a.y
              })
              if (ridx >= 0) {
                remaining.splice(ridx,1)
              }
            }
          } else {
            console.log('pediu pra parar parou atk')
          }
          if (!remaining.includes(u)){
            remaining.push(u)
          }
        } // end attack

      } // end queue
      queue.push(...remaining)
      if (queue.length > 0) {
        printGrid(grid)
        // console.log(units)
        h = units.reduce((acc, val) => {
          return acc + val.hp
        }, 0)
        console.log(round, h, round*h)
      }
    } // end round
    if (round >= limit) {
      console.log('round limit exceeded')
    }
    // printGrid(grid)

    var health = units.reduce((acc, val) => {
      return acc + val.hp
    }, 0)
    var outcome = round * health
    // console.log(round, health, outcome)
    // Correct Answer: 76 2720 206720
    // Code corrected thanks to: https://lamperi.name/aoc/

    $('#day15').append(input[i])
      .append('<br>&emsp;')
      .append(outcome)
      .append('<br>')
  }
}

var printGrid = function(grid) {
  var outString = ''
  for (var i = 0; i < grid.length; i++) {
    for (var j = 0; j < grid[i].length; j++) {
      outString += grid[i][j]
    }
    outString += '\n'
  }

  console.log(outString)
}

var canAttack = function(u) {
  return (
    ('GE'.includes(grid[u.x+1][u.y]) && grid[u.x+1][u.y] !== u.type)
    || ('GE'.includes(grid[u.x-1][u.y]) && grid[u.x-1][u.y] !== u.type)
    || ('GE'.includes(grid[u.x][u.y+1]) && grid[u.x][u.y+1] !== u.type)
    || ('GE'.includes(grid[u.x][u.y-1]) && grid[u.x][u.y-1] !== u.type))
}

var directions = [
  function(state){state.y--;},
  function(state){state.y++;},
  function(state){state.x--;},
  function(state){state.x++;}
]
var generateMoves = function(st) {
  var moves = []
  $.each(directions, function(idx, dirFun) {
    var newState = cloneState(st)
    dirFun(newState)
    if(isValid(newState)) {
      newState.steps++
      newState.trace += genTrace(newState)
      moves.push(newState)
    }
  })
  return moves
}

var cloneState = function(state) {
  var newState = {
    'x': state.x,
    'y': state.y,
    'steps': state.steps,
    'trace': state.trace
  }
  return newState
}

var isValid = function(st) {
  return (0 <= st.x && st.x < grid.length) // within maze
      && (0 <= st.y && st.y < grid[st.x].length)
      && (grid[st.x][st.y] === '.') // is a space
      && (!st.trace.includes(genTrace(st))) // not repeated step
}

var genTrace = function(st) {
  return ':'+st.x+','+st.y
}

var day15Part2 = function () {
  var eap = 34 // elf attack power

  // for (var i = 3; i < input.length-1; i++) {
  for (var i = 10; i < input.length; i++) {
    if (i===4) { continue }
    var lines = input[i].split(/\n+/)
    grid = []
    var elfcount = 0
    var units = []
    for (var gx = 0; gx < lines.length; gx++) {
      grid[gx] = []
      var cells = lines[gx].split('')
      for (var gy = 0; gy < cells.length; gy++) {
        grid[gx][gy] = cells[gy]
        if (cells[gy] === 'G') {
          units.push({
            'x': gx,
            'y': gy,
            'type': cells[gy],
            'attack': 3,
            'hp': 200
          })
        }
        if (cells[gy] === 'E') {
          elfcount++
          units.push({
            'x': gx,
            'y': gy,
            'type': cells[gy],
            'attack': eap,
            'hp': 200
          })
        }
      }
    }
    // console.log(grid)

    var queue = []
    queue.push(...units)
    var limit = 1000
    var round = 0
    while (round++ < limit && queue.length > 0) {
      // console.log(queue)
      queue.sort((a,b) => {
        return (a.x - b.x) !== 0 ? (a.x - b.x) : (a.y - b.y)
      })
      var remaining = []
      while (queue.length > 0) {
        // check if game has ended
        var gobs = units.reduce((acc, val) => {
          return acc + (val.type === 'G')
        }, 0)
        var elves = units.reduce((acc, val) => {
          return acc + (val.type === 'E')
        }, 0)
        if (gobs === 0 || elves === 0) {
          // game over
          round-=2 // not a full round
          queue = [] // clear the queue
          remaining = []
          // it will still do another round with an empty queue then finish
          break
        }
        // play the unit
        var u = queue.shift()
        if (!canAttack(u)) { // move
          // find possible moves
          var neighbours = []
          if (grid[u.x+1][u.y] === '.') { neighbours.push({x: u.x+1, y: u.y}) }
          if (grid[u.x-1][u.y] === '.') { neighbours.push({x: u.x-1, y: u.y}) }
          if (grid[u.x][u.y+1] === '.') { neighbours.push({x: u.x, y: u.y+1}) }
          if (grid[u.x][u.y-1] === '.') { neighbours.push({x: u.x, y: u.y-1}) }
          if (neighbours.length === 0) {
            // can't move
            remaining.push(u)
            continue
          }
          // find targets
          var targets = units.filter((other) => {
            return other.type !== u.type
          })
          if (targets.length === 0) {
            // finished
            break
          }
          targets.sort((a,b) => { // put the closer ones first
            var atou = (Math.abs(a.x - u.x) + Math.abs(a.y - u.y))
            var btou = (Math.abs(b.x - u.x) + Math.abs(b.y - u.y))
            return atou - btou
          })
          // find targets in range
          var inRange = []
          $.each(targets, (tidx, t) => {
            if (grid[t.x+1][t.y] === '.') { inRange.push({x: t.x+1, y: t.y}) }
            if (grid[t.x-1][t.y] === '.') { inRange.push({x: t.x-1, y: t.y}) }
            if (grid[t.x][t.y+1] === '.') { inRange.push({x: t.x, y: t.y+1}) }
            if (grid[t.x][t.y-1] === '.') { inRange.push({x: t.x, y: t.y-1}) }
          })
          inRange.sort((a,b) => { // put the closer ones first
            var atou = (Math.abs(a.x - u.x) + Math.abs(a.y - u.y))
            var btou = (Math.abs(b.x - u.x) + Math.abs(b.y - u.y))
            if (atou - btou !== 0) {
              return atou - btou
            } else { // if it's the same distance, order by grid position
              return (a.x - b.x) !== 0 ? (a.x - b.x) : (a.y - b.y)
            }
          })
          // filter by those that are reachable
          // by calculating the distance to it
          var nearStates = []
          $.each(inRange, (ridx, r) => {
            var shortestPath = 100 // 246 open spaces
            var initialState = {'x': r.x, 'y':r.y, 'steps': 0, 'trace': ':'+r.x+','+r.y}
            var history = []
            var nextStates = [initialState]
            var timeout = 100000
            while (nextStates.length > 0 && --timeout) {
              if (timeout % 50000 === 0) {
                console.log(shortestPath, nextStates.length)
              }
              var state = nextStates.shift()
              // var state = nextStates.pop()
              if (history[state.x] === undefined) { history[state.x] = [] }
              if (history[state.x][state.y] === undefined) {
                history[state.x][state.y] = state.steps
              } else if (history[state.x][state.y] <= state.steps) { // drop paths longer than history TODO TEST <=
                continue
              } else {
                history[state.x][state.y] = state.steps
              }
              var match = neighbours.find((n) => {
                return n.x === state.x && n.y === state.y
              })
              if (match) {
                shortestPath = state.steps < shortestPath ? state.steps : shortestPath
                if (nearStates.find((n) => {
                    return n.x === state.x && n.y === state.y && n.steps === state.steps && n.trace === state.trace
                  }) === undefined) { // avoid duplicates
                  nearStates.push(state)
                }
              } else {
                //generate next states
                var genMoves = []
                $.each(generateMoves(state), function(idx, gm) {
                  if (gm.steps <= shortestPath) { // include only paths shorter or equal than already found
                    if (history[gm.x] && history[gm.x][gm.y] && history[gm.x][gm.y] <= gm.steps) { // drop paths longer than history TODO TEST <=
                      return true
                    }
                    if (nextStates.find((other) => { // don't add repeated states. or at least repeated that have more steps
                      return gm.x === other.x && gm.y === other.y && gm.steps > other.steps
                    }) >= 0) { return true }
                    // compare the current shortest path to the generated move
                    var remSteps = shortestPath - gm.steps
                    var currentToDest = (Math.abs(u.x - gm.x) + Math.abs(u.y - gm.y))
                    if (currentToDest <= remSteps+1) { // only add if there is a way to be shorter (straight path)
                      genMoves.push(gm)
                    }
                  }
                })
                genMoves.sort((a,b) => { // put the closer ones first
                  var atou = (Math.abs(a.x - u.x) + Math.abs(a.y - u.y))
                  var btou = (Math.abs(b.x - u.x) + Math.abs(b.y - u.y))
                  return atou - btou
                })
                nextStates.push(...genMoves)
              }
            }
            if (!timeout) {
              console.log('timeout!')
            }
          })

          // Nearest
          if (nearStates.length === 0) {
            // no path found. stand still
            remaining.push(u)
            continue
          }
          nearStates.sort((a,b) => {
            if (a.steps - b.steps !== 0) {
              return a.steps - b.steps
            } else {
              var srcA = $.map(a.trace.split(':')[1].split(','), (n)=>{return Number(n)})
              var srcB = $.map(b.trace.split(':')[1].split(','), (n)=>{return Number(n)})
              if (srcA[0] === srcB[0]) {
                if (srcA[1] === srcB[1]) {
                  return (a.x - b.x) !== 0 ? (a.x - b.x) : (a.y - b.y)
                } else {
                  return srcA[1] - srcB[1]
                }
              } else {
                return srcA[0] - srcB[0]
              }
            }
          })
          // Chosen
          var nearest = nearStates[0]

          if ((Math.abs(u.x - nearest.x) + Math.abs(u.y - nearest.y)) !== 1) {
            console.log('pediu pra parar parou')
          }
          // get model index
          var uidx = units.findIndex((m) => {
            return m.x === u.x && m.y === u.y
          })
          // effectively move on grid
          grid[u.x][u.y] = '.'
          u.x = nearest.x
          u.y = nearest.y
          grid[u.x][u.y] = u.type
          remaining.push(u)
          // update model
          units[uidx].x = u.x
          units[uidx].y = u.y
        } // end move

        if (canAttack(u)) { // might be able to attack after has moved
          var targets = []
          if ('GE'.includes(grid[u.x+1][u.y]) && grid[u.x+1][u.y] !== u.type) { // up
            targets.push(units.find((t) => {
              return (t.x === u.x+1) && (t.y === u.y) && (t.type !== u.type)
            }))
          }
          if ('GE'.includes(grid[u.x-1][u.y]) && grid[u.x-1][u.y] !== u.type) { // down
            targets.push(units.find((t) => {
              return (t.x === u.x-1) && (t.y === u.y) && (t.type !== u.type)
            }))
          }
          if ('GE'.includes(grid[u.x][u.y+1]) && grid[u.x][u.y+1] !== u.type) { // right
            targets.push(units.find((t) => {
              return (t.x === u.x) && (t.y === u.y+1) && (t.type !== u.type)
            }))
          }
          if ('GE'.includes(grid[u.x][u.y-1]) && grid[u.x][u.y-1] !== u.type) { // left
            targets.push(units.find((t) => {
              return (t.x === u.x) && (t.y === u.y-1) && (t.type !== u.type)
            }))
          }
          // sort targets by hp,x,y
          targets.sort((a,b) => {
            if (a.hp - b.hp !== 0) {
              return a.hp - b.hp
            } else {
              return (a.x - b.x) !== 0 ? (a.x - b.x) : (a.y - b.y)
            }
          })
          // find target in arrays
          var atk = targets[0]
          var atkIdx = units.findIndex((a) => {
            return atk.x === a.x && atk.y === a.y
          })
          if (atkIdx >= 0) {
            // subtract u.attack from target.hp
            units[atkIdx].hp -= u.attack
            // if target.hp <= 0 then remove from units and grid
            if (units[atkIdx].hp <= 0) {
              grid[units[atkIdx].x][units[atkIdx].y] = '.'
              units.splice(atkIdx,1)
              // remove unit from queue/remaining too
              var qidx = queue.findIndex((a) => {
                return atk.x === a.x && atk.y === a.y
              })
              if (qidx >= 0) {
                queue.splice(qidx,1)
              }
              var ridx = remaining.findIndex((a) => {
                return atk.x === a.x && atk.y === a.y
              })
              if (ridx >= 0) {
                remaining.splice(ridx,1)
              }
            }
          } else {
            console.log('pediu pra parar parou atk')
          }
          if (!remaining.includes(u)){
            remaining.push(u)
          }
        } // end attack

      } // end queue
      queue.push(...remaining)
      if (queue.length > 0) {
        // printGrid(grid)
        // console.log(units)
        // h = units.reduce((acc, val) => {
        //   return acc + val.hp
        // }, 0)
        // console.log(round, h, round*h)
      }
    } // end round
    if (round >= limit) {
      console.log('round limit exceeded')
    }
    // printGrid(grid)

    var health = units.reduce((acc, val) => {
      return acc + val.hp
    }, 0)
    var outcome = round * health
    var winner = units[0].type
    var elvesAlive = units.reduce((acc, u) => {
      return acc + (u.type === 'E' ? 1 : 0)
    },0)
    var deadElves = elvesAlive !== elfcount

    // console.log(round, health, outcome, winner, deadElves)
    // i=3 4988 eap 15
    // i=4 elfs win anyway
    // i=5 31284 eap 4
    // i=6 3478 eap 15
    // i=7 6474 eap 12
    // i=8 1140 eap 34
    // i=9 517 eap 9

    // i=10 puzzle input:
    // 10 win but has dead elves
    // 20 win but has dead elves
    // 30 win but has dead elves
    // 32 win but has dead elves
    // 33 win but has dead elves
    // 34 ok FINAL ANSWER
    // 35 ok
    // 40 ok
    // 50 ok
    // 100 ok

    $('#part2').append(input[i])
      .append('<br>&emsp;')
      .append(outcome)
      .append('<br>')
  }

}

$(function (){
  $('#main').append('<div id="day15"><h2>day #15</h2></div>')
  // day15()
  $('#main').append('<br><div id="part2"><h2>part 2</h2></div>')
  day15Part2()
  $('#main').append('<br>')
})
