const Pinhossel = {
  SPEED: 250,
  animation_running: false,
  initial_x: 0,
  initial_y: 0,
  delta_x: 0,
  delta_y: 0, 
  moving: false,
  initial_target: undefined,

  Target: function (e) {
    return window.innerHeight <= window.innerWidth ? e.target
      : e.changedTouches.item(0).target
  },

  EVX: function (e) {
    return window.innerHeight <= window.innerWidth ? e.clientX
      : e.changedTouches.item(0).clientX
  },

  EVY: function (e) {
    return window.innerHeight <= window.innerWidth ? e.clientY
      : e.changedTouches.item(0).clientY
  },

  Build_Cyclic: function (pi, kids) {
    const n = kids.length
    kids.forEach((x, i) => {
      x.classList.add('pinhosselement')
      x.style.position = 'absolute'
      x.prev = kids[(i + n - 1) % n]
      x.next = kids[(i + 1) % n]
      $(x).css({
        width: '100%',
        userDrag: 'none',
        userSelect: 'none'
      })
      x.style.left = '100%'
      pi.appendChild(x)
    })
    kids[0].style.left = '0'
    kids[n - 1].style.left = '-100%'
  },

  Images_From_Links: function (image_links) {
    return image_links.map(x => {
      img = new Image()
      img.src = x
      return img
    })
  },

  Build: function (pi, kids) {
    if (kids.length == 0)
      return
    if (kids.length == 1) {
      $(kids[0]).css('width', `${$(pi).css('width')}`)
      pi.appendChild(kids[0])
      $(pi).css('cursor', 'auto')
      return
    }

    Pinhossel.Build_Cyclic(pi, kids)

    pi.style.overflow = 'hidden'
    const left_arrow = Pinhossel.Arrow.clone()
    const right_arrow = Pinhossel.Arrow.clone()
    const h = pi.clientHeight
    const arrows = left_arrow.add(right_arrow)
    const mult = window.innerHeight > window.innerWidth ? 1.9 : 1
    left_arrow.css({
      left: 0.03 * mult * h,
      transform: 'translate(0, -50%)'
    })
    right_arrow.css({
      right: 0.03 * mult * h,
      transform: 'translate(0, -50%) rotateY(180deg)'
    })
    arrows.css({
      position: 'absolute',
      width: 0.05 * mult * h,
      height: 0.05 * mult * h,
      zIndex: 8,
      pointerEvents: 'none',
      touchAction: 'none',
      top: '50%'
    })
    $(pi).append(left_arrow)
    $(pi).append(right_arrow)
  },

  Run: function (autorun = false) {
    if (window.innerHeight > window.innerWidth) {
      $('.pinhosselement')
        .on('touchstart', Pinhossel.Down_Handler)  
        .on('touchend', Pinhossel.Up_Handler)
      $('body').on('touchmove', Pinhossel.Move_Handler)
    }
    else {
      $('.pinhosselement')
        .mousedown(Pinhossel.Down_Handler)
        .mouseup(Pinhossel.Up_Handler)
      $('body').mousemove(Pinhossel.Move_Handler)
    }
  },

  Down_Handler: function (e) {
    Pinhossel.initial_target = Pinhossel.Target(e)
    Pinhossel.delta_x = 0
    Pinhossel.initial_x = Pinhossel.EVX(e)
    Pinhossel.initial_y = Pinhossel.EVY(e)
    Pinhossel.moving = true
  },

  Move_Handler: function (e) {
    if (!Pinhossel.moving)
      return

    const targ = Pinhossel.Target(e)

    if (targ.className.includes('pinhosselement')) {
      Pinhossel.delta_x = Pinhossel.EVX(e) - Pinhossel.initial_x
      Pinhossel.delta_y = Pinhossel.EVY(e) - Pinhossel.initial_y
      if (Math.abs(Pinhossel.delta_y) > Math.abs(Pinhossel.delta_x))
        return
      $(targ).css('left', `${Pinhossel.delta_x}px`)
      if (Pinhossel.delta_x > 0)
        $(targ.prev).css('left', `calc(-100% + ${Pinhossel.delta_x}px)`)
      else
        $(targ.next).css('left', `calc(100% + ${Pinhossel.delta_x}px)`)
    }
    else {
      Pinhossel.moving = false
      Pinhossel.Reset()
      $('body').css('background-color', 'black')
    }
  },

  Up_Handler: function (e) {
    Pinhossel.moving = false
    if (Pinhossel.animation_running)
      return

    if (Math.abs(Pinhossel.delta_y) > Math.abs(Pinhossel.delta_x)
        && Math.abs(Pinhossel.delta_y) > 40) {
      Pinhossel.Reset()
      return
    }

    const targ = Pinhossel.Target(e)
    const rect = targ.getBoundingClientRect()
    const x = Pinhossel.EVX(e) - rect.left

    if (Math.abs(Pinhossel.delta_x) < 40) {
      if (x < rect.width / 2)
        Pinhossel.Go_Left(targ, true)
      else
        Pinhossel.Go_Right(targ, true)
    }
    else if (Pinhossel.delta_x > 0)
      Pinhossel.Go_Left(targ)
    else
      Pinhossel.Go_Right(targ)
  },

  Reset: function () {
    const el = Pinhossel.initial_target
    $(el).animate({ left: '0' }, Pinhossel.SPEED)
    $(el.prev).animate({ left: '-100%' }, Pinhossel.SPEED)
    $(el.next).animate({ left: '100%' }, Pinhossel.SPEED)
  },

  Go_Right: function (x, clicked = false) {
    if (Pinhossel.animation_running)
      return
    Pinhossel.animation_running = true
    if (clicked)
      $(x.next).css('left', '100%')
    $(x.next).css('z-index', 4)
    $(x).css('z-index', '1')
    $(x.next).animate({ left: 0 }, Pinhossel.SPEED)
    $(x).animate({ left: '-100%' }, Pinhossel.SPEED, () => {
      Pinhossel.animation_running = false
    })
  },

  Go_Left: function (x, clicked = false) {
    if (Pinhossel.animation_running)
      return
    Pinhossel.animation_running = true
    if (clicked)
      $(x.prev).css('left', '-100%')
    $(x.prev).css('z-index', 4)
    $(x).css('z-index', '1')
    $(x.prev).animate({ left: 0 }, Pinhossel.SPEED)
    $(x).animate({ left: '100%' }, Pinhossel.SPEED, () => {
      Pinhossel.animation_running = false
    })
  },

  Arrow: $(`<svg viewBox="0 0 449 449">
	<style>
		tspan { white-space:pre }
		.shp0 { fill: #ffffff } 
		.shp1 { fill: #373b39 } 
	</style>
	<path id="Layer" class="shp0" d="M432.99 16.01L16.99 224.01L432.99 432.01L304.99 224.01L432.99 16.01Z" />
	<path id="Layer" fill-rule="evenodd" class="shp1" d="M425.82 446.31L9.82 238.31C6.74 236.76 4.24 234.26 2.69 231.18C-1.27 223.28 1.92 213.66 9.82 209.7L425.82 1.7C430.78 -0.78 436.66 -0.53 441.38 2.38C448.91 7.01 451.25 16.86 446.62 24.39L323.78 224.01L446.62 423.62C448.18 426.15 449 429.05 449 432.01C448.99 440.85 441.83 448.01 432.99 448.01C430.5 448.01 428.05 447.43 425.82 446.31ZM52.77 224.01L389.95 392.62L291.36 232.39C288.2 227.25 288.2 220.76 291.36 215.62L389.95 55.4L52.77 224.01Z" />
  </svg>
  `)
}