var input = [
String.raw`/->-\........
|...|../----\
|./-+--+-\..|
|.|.|..|.v..|
\-+-/..\-+--/
..\------/...`,
String.raw`/>-<\..
|...|..
|./<+-\
|.|.|.v
\>+</.|
..|...^
..\<->/`,
 puzzleInput
]


var day13 = function() {

  for (var i = 0; i < input.length; i++) {
    var rawIn = input[i].split(/\n+/)
    // console.log(rawIn)
    var carts = []
    var grid = []
    var turn = ['<', '^', '>', 'v']
    $.each(rawIn,(lidx, line) => {
      grid[lidx] = []
      $.each(line.split(''), (cidx,cell) => {
        grid[lidx][cidx] = cell
        if (turn.includes(cell)) {
          var track = '<>'.includes(cell) ? '-' : '|'
          carts.push({
            'y':lidx,
            'x':cidx,
            'dir':cell,
            'nextTurn':'left',
            'track': track
          })
        }
      })
    })
    // console.log(carts)
    // console.log(grid)

    var tick = 0
    var limit = 150000
    var crashX = -1
    var crashY = -1
    while (tick++ < limit) {
      carts.sort((a,b) => {
        return (a.x - b.x) !== 0 ? (a.x - b.x) : (a.y - b.y)
      })

      $.each(carts,(idx, cart) => {
        grid[cart.y][cart.x] = cart.track
        if (cart.dir === '>') {
          cart.x++
          cart.track = grid[cart.y][cart.x]
          if (cart.track === '/') {
            cart.dir = '^'
          } else if (cart.track === '\\') {
            cart.dir = 'v'
          }
        } else if (cart.dir === '<') {
          cart.x--
          cart.track = grid[cart.y][cart.x]
          if (cart.track === '/') {
            cart.dir = 'v'
          } else if (cart.track === '\\') {
            cart.dir = '^'
          }
        } else if (cart.dir === 'v') {
          cart.y++
          cart.track = grid[cart.y][cart.x]
          if (cart.track === '/') {
            cart.dir = '<'
          } else if (cart.track === '\\') {
            cart.dir = '>'
          }
        } else { // ^
          cart.y--
          cart.track = grid[cart.y][cart.x]
          if (cart.track === '/') {
            cart.dir = '>'
          } else if (cart.track === '\\') {
            cart.dir = '<'
          }
        }
        if (cart.track === '+') {
          //1 left, 2 straight, 3 right
          if (cart.nextTurn === 'left') {
            cart.nextTurn = 'straight'
            cart.dir = turn[(turn.indexOf(cart.dir) + 3) % 4]
          } else if (cart.nextTurn === 'straight') {
            cart.nextTurn = 'right'
            //cart.dir = cart.dir
          } else { // right
            cart.nextTurn = 'left'
            cart.dir = turn[(turn.indexOf(cart.dir) + 1) % 4]
          }
        }
        if (turn.includes(cart.track)) { // CRASH
          crashX = cart.x
          crashY = cart.y
          return false
        } else {
          grid[cart.y][cart.x] = cart.dir
        }
      })
      if (crashX > -1) {
        break
      }
    }

    var crashLocation = crashX+','+crashY

    $('#day13').append(input[i])
      .append('<br>&emsp;')
      .append(crashLocation)
      .append('<br>')
  }
}

var day13Part2 = function () {

  for (var i = 1; i < input.length; i++) {
    var rawIn = input[i].split(/\n+/)
    // console.log(rawIn)
    var carts = []
    var grid = []
    var turn = ['<', '^', '>', 'v']
    $.each(rawIn,(lidx, line) => {
      grid[lidx] = []
      $.each(line.split(''), (cidx,cell) => {
        grid[lidx][cidx] = cell
        if (turn.includes(cell)) {
          var track = '<>'.includes(cell) ? '-' : '|'
          carts.push({
            'y':lidx,
            'x':cidx,
            'dir':cell,
            'nextTurn':'left',
            'track': track
          })
        }
      })
    })
    // console.log(carts)
    // console.log(grid)

    var tick = 0
    var limit = 200000
    var crashX = -1
    var crashY = -1
    var cartsToRemove = []
    while (tick++ < limit) {
      carts.sort((a,b) => {
        return (a.x - b.x) !== 0 ? (a.x - b.x) : (a.y - b.y)
      })
      // tick begin
      $.each(carts,(idx, cart) => {
        grid[cart.y][cart.x] = cart.track
        if (cart.dir === '>') {
          cart.x++
          cart.track = grid[cart.y][cart.x]
          if (cart.track === '/') {
            cart.dir = '^'
          } else if (cart.track === '\\') {
            cart.dir = 'v'
          }
        } else if (cart.dir === '<') {
          cart.x--
          cart.track = grid[cart.y][cart.x]
          if (cart.track === '/') {
            cart.dir = 'v'
          } else if (cart.track === '\\') {
            cart.dir = '^'
          }
        } else if (cart.dir === 'v') {
          cart.y++
          cart.track = grid[cart.y][cart.x]
          if (cart.track === '/') {
            cart.dir = '<'
          } else if (cart.track === '\\') {
            cart.dir = '>'
          }
        } else { // ^
          cart.y--
          cart.track = grid[cart.y][cart.x]
          if (cart.track === '/') {
            cart.dir = '>'
          } else if (cart.track === '\\') {
            cart.dir = '<'
          }
        }
        if (cart.track === '+') {
          //1 left, 2 straight, 3 right
          if (cart.nextTurn === 'left') {
            cart.nextTurn = 'straight'
            cart.dir = turn[(turn.indexOf(cart.dir) + 3) % 4]
          } else if (cart.nextTurn === 'straight') {
            cart.nextTurn = 'right'
            //cart.dir = cart.dir
          } else { // right
            cart.nextTurn = 'left'
            cart.dir = turn[(turn.indexOf(cart.dir) + 1) % 4]
          }
        }
        if (turn.includes(cart.track)) { // CRASH
          // this is the second (or 3rd?) to come
          // grid[cart.y][cart.x] = oldTrack //everybody must crash before restoring
          var crashed = carts.filter((c) => {
            return c.x === cart.x && c.y === cart.y
          })
          cartsToRemove.push(...crashed)
        } else {
          grid[cart.y][cart.x] = cart.dir
        }
      })
      // tick end
      // remove carts
      if (cartsToRemove.length > 0) {
        $.each(cartsToRemove, (idx, c) => {
          if (!turn.includes(c.track)) {
            // only the first who arrived will have the original track
            // the following will all have a car in the c.track
            grid[c.y][c.x] = c.track
          }
        })
        carts = carts.filter((c) => {
          return !cartsToRemove.includes(c)
        })
        cartsToRemove = []
      }
      // finished?
      if (carts.length === 1) {
        break
      }
    }

    var lastCart = carts.pop()
    var lastCartLocation = lastCart.x+','+lastCart.y
    // I need the position before the last tick
    if (carts.length > 0) {
      // limit reached!
      lastCartLocation = undefined
    }
    // 100,37 wrong

    $('#part2').append(input[i])
      .append('<br>&emsp;')
      .append(lastCartLocation)
      .append('<br>')
  }

}

$(function (){
  $('#main').append('<div id="day13"><h2>day #13</h2></div>')
  day13()
  $('#main').append('<br><div id="part2"><h2>part 2</h2></div>')
  day13Part2()
  $('#main').append('<br>')
})
