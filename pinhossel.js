const Pinhossel = {
  Build_Cyclic: function (pi, kids) {
    const n = kids.length
    kids.forEach((x, i) => {
      x.classList.add('pinhosselement')
      x.style.position = 'absolute'
      x.prev = kids[(i + n - 1) % n]
      x.next = kids[(i + 1) % n]
      $(x).css('width', `${$(pi).css('width')}`)
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
      return
    }

    this.Build_Cyclic(pi, kids)

    pi.style.overflow = 'hidden'
    const left_arrow = Pinhossel.Left_Arrow.clone()
    const right_arrow = Pinhossel.Right_Arrow.clone()
    const h = pi.clientHeight
    const arrows = left_arrow.add(right_arrow)
    const mult = window.innerHeight > window.innerWidth ? 2.5 : 1
    left_arrow.css({
      left: 0.03 * mult * h
    })
    right_arrow.css({
      right: 0.03 * mult * h
    })
    arrows.css({
      position: 'absolute',
      width: 0.05 * mult * h,
      height: 0.05 * mult * h,
      zIndex: 8,
      pointerEvents: 'none',
      touchAction: 'none',
      top: '50%',
      transform: 'translate(0, -50%)'
    })
    $(pi).append(left_arrow)
    $(pi).append(right_arrow)
  },

  Run: function (autorun = false) {
    if (window.innerHeight > window.innerWidth) {
      $('.pinhosselement')
        .on('touchstart', this.Down_Handler)
        .on('touchmove', this.Move_Handler)
        .on('touchend', this.Up_Handler)
    }
    else {
      $('.pinhosselement')
        .mousedown(this.Down_Handler)
        .mousemove(this.Move_Handler)
        .mouseup(this.Up_Handler)
    }
  },

  animation_running: false,

  Go_Right: function (x, clicked = false) {
    if (Pinhossel.animation_running)
      return
    Pinhossel.animation_running = true
    if (clicked)
      $(x.next).css('left', '100%')
    $(x.next).css('z-index', 4)
    $(x).css('z-index', '1')
    $(x.next).animate({ left: 0 })
    $(x).animate({ left: '-100%' }, () => {
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
    $(x.prev).animate({ left: 0 })
    $(x).animate({ left: '100%' }, () => {
      Pinhossel.animation_running = false
    })
  },

  EVX: function (e) {
    return window.innerHeight <= window.innerWidth ? e.clientX
      : e.originalEvent.touches[0].clientX
  },

  Click_Handler: function (e) {
    e.preventDefault()
    if (window.innerHeight > window.innerWidth) {
      $(e.target).css('left', '0')
      $(e.target.prev).css('left', '-100%')
      $(e.target.next).css('left', '100%')
      return
    }
    const rect = e.target.getBoundingClientRect()
    const x = e.clientX - rect.left

    if (x < rect.width / 2)
      Pinhossel.Go_Left(e.target, true)
    else
      Pinhossel.Go_Right(e.target, true)
  },

  initial_x: 0,
  delta_x: 0,
  moving: false,

  Down_Handler: function (e) {
    e.preventDefault()
    Pinhossel.delta_x = 0
    Pinhossel.initial_x = Pinhossel.EVX(e)
    Pinhossel.moving = true
  },

  Move_Handler: function (e) {
    e.preventDefault()
    if (!Pinhossel.moving)
      return
    Pinhossel.delta_x = Pinhossel.EVX(e) - Pinhossel.initial_x
    const x = e.target
    x.style.left = Pinhossel.delta_x
    if (Pinhossel.delta_x > 0) 
      $(x.prev).css('left', `calc(-100% + ${Pinhossel.delta_x}px)`)
    else
      $(x.next).css('left', `calc(100% + ${Pinhossel.delta_x}px)`)
  },

  Up_Handler: function (e) {
    Pinhossel.moving = false
    if (Pinhossel.animation_running)
      return

    if (Math.abs(Pinhossel.delta_x) < 60)
      Pinhossel.Click_Handler(e)
    else if (Pinhossel.delta_x > 0)
      Pinhossel.Go_Left(e.target)
    else
      Pinhossel.Go_Right(e.target)
  },

  Left_Arrow: $(`<svg viewBox="0 0 449 449">
	<style>
		tspan { white-space:pre }
		.shp0 { fill: #ffffff } 
		.shp1 { fill: #373b39 } 
	</style>
	<path id="Layer" class="shp0" d="M432.99 16.01L16.99 224.01L432.99 432.01L304.99 224.01L432.99 16.01Z" />
	<path id="Layer" fill-rule="evenodd" class="shp1" d="M425.82 446.31L9.82 238.31C6.74 236.76 4.24 234.26 2.69 231.18C-1.27 223.28 1.92 213.66 9.82 209.7L425.82 1.7C430.78 -0.78 436.66 -0.53 441.38 2.38C448.91 7.01 451.25 16.86 446.62 24.39L323.78 224.01L446.62 423.62C448.18 426.15 449 429.05 449 432.01C448.99 440.85 441.83 448.01 432.99 448.01C430.5 448.01 428.05 447.43 425.82 446.31ZM52.77 224.01L389.95 392.62L291.36 232.39C288.2 227.25 288.2 220.76 291.36 215.62L389.95 55.4L52.77 224.01Z" />
  </svg>
  `), 

  Right_Arrow: $(`<svg viewBox="0 0 449 449">
	<style>
		tspan { white-space:pre }
		.shp0 { fill: #ffffff } 
		.shp1 { fill: #373b39 } 
	</style>
	<path id="Layer" class="shp0" d="M16.01 16.01L432.01 224.01L16.01 432.01L144.01 224.01L16.01 16.01Z" />
	<path id="Layer" fill-rule="evenodd" class="shp1" d="M16.01 448.01C7.17 448.01 0.01 440.85 0 432.01C0 429.05 0.82 426.15 2.38 423.62L125.22 224.01L2.38 24.39C-2.25 16.86 0.09 7.01 7.62 2.38C12.34 -0.53 18.22 -0.78 23.18 1.7L439.18 209.7C447.08 213.66 450.27 223.28 446.31 231.18C444.76 234.26 442.26 236.76 439.18 238.31L23.18 446.31C20.95 447.43 18.5 448.01 16.01 448.01ZM59.05 55.4L157.64 215.62C160.8 220.76 160.8 227.25 157.64 232.39L59.05 392.62L396.23 224.01L59.05 55.4Z" />
  </svg>
  `)
}