/**
 *  Библиотека для работы с тач жестами.
 *
 *  @author		<a href="mailto:artem.malko@gmail.com">Artem Malko</a>
 *  @copyright	2014
 *  @version	0.1.0
 */

/* TODO:
	
	1) Detection of events like:
		1) Double tap 
		2) Rotate
		3) Two finger swipe
		4) Three finger swipe
		5) Pinch in
		6) Pinch out
		7) Drag
		8) ...
	
	2) Config.
	3) Jquery trigger on events detection (make it optional).
	4) touchcancel event handler.
	5) touchleave ???
	6) Select body element

*/


var niceTouch = function() {
	this._init();
}

niceTouch.prototype = {
	
	// TODO: написать конфиг
	_config: {

	},

	_init: function() {
		var that = this;

		// TODO!!!!! Уже решить что-нить с выборкой элемента body
		// that.body = document.getElementsByTagName('body');
		that._body = $('body');
		that._body = that._body[0];

		// Координаты начала касания (Х и У)
		that._onTouchStartPositionX = 0;
		that._onTouchStartPositionY = 0;

		// Массив координат касаний, 
		// [0] - предыдущая, [1] - текущая
		that._touchArrayX = [0,0];
		that._touchArrayY = [0,0];

		// Переменные-направления
		// Общее направление
		that._direction = 'none';
		// Направление свайпа по оси Х
		that._horizontalDirection = 'none';
		// Направление свайпа по оси Y
		that._verticalDirection = 'none';

		// Переменная-признак вертикального свайпа
		that._isVertical = false;

		// Переменная-признак горизонтального свайпа
		that._isHorizontal = false;

		// Переменная признак начала свайпа, первого тача
		that._isFirstTouch = false;

		// Время начала жеста
		that._startTime = 0;

		// Время окончания жеста
		that._endTime = 0;

		// Время выполнения жеста
		that._eventTime = 0;

		// Название жеста
		that._eventName = 'tap';

		// Добавляем слушателей тач. событий
		that._body.addEventListener('touchstart', 
			function(event) { 
				$('.debug').text('touchStart');
				that._onTouchStart(event);
			},
			false
		);

		that._body.addEventListener('touchmove', 
			function(event) { 
				$('.debug').text('touchMove');
				that._onTouchMove(event);
			},
			false
		);

		that._body.addEventListener('touchend', 
			function(event) { 
				$('.debug').text('touchEnd');
				that._onTouchEnd(event);
			},
			false
		);

		that._body.addEventListener('touchcancel', 
			function(event) { 
				$('.debug').text('touchCancel');
				that._onTouchCancel(event);
			},
			false
		);
	},

	// Метод для работы во  время события touchstart
	_onTouchStart: function(event) {
		var that = this;

		that._startTime = Number(new Date());

		// Получаем координаты касания
		that._onTouchStartPositionX = event.touches[0].pageX;	
		that._onTouchStartPositionY = event.touches[0].pageY;

		// И заносим их в массив координат касаний
		that._touchArrayX[0] = that._onTouchStartPositionX;
		that._touchArrayY[0] = that._onTouchStartPositionY;

		that._isFirstTouch = true;
	},


	_onTouchMove: function(event) {
		var that = this;

		that._isFirstTouch = false;

		// Получаем новое местоположение пальца на экране
		that._touchArrayX[1] = event.touches[0].pageX;
		that._touchArrayY[1] = event.touches[0].pageY;

		// Получаем сдвиг по вертикали и горизонтали.
		// Абсолютные значения сдвигов нужны для определения
		// того, что свайп вертикальный или горизонтальный
		var _verticalDelta = that._touchArrayY[1] - that._touchArrayY[0],
			_horizontalDelta = that._touchArrayX[1] - that._touchArrayX[0],
			_swipeWidth = Math.abs(_horizontalDelta),
			_swipeHeight = Math.abs(_verticalDelta);

		if (_verticalDelta > 0) {
			that._verticalDirection = 'bottom';
		} else {
			that._verticalDirection = 'top';
		}

		if (_horizontalDelta > 0) {
			that._horizontalDirection = 'right';
		} else {
			that._horizontalDirection = 'left';
		}	

		that._touchArrayX[0] = that._touchArrayX[1];
		that._touchArrayY[0] = that._touchArrayY[1];
		
		// Если по высоте свайп был больше, чем по ширине,
		// то свайп был вертикальный.
		// Свайп будет считаться сделанным по горизонтали, если
		// угол между вектором свайпа и осью X будет меньше 45 градусов.
		if (_swipeHeight >= _swipeWidth) { 
			that._isVertical = true; 
			that._isHorizontal = false;
			that._direction = that._verticalDirection;

		} else { 
			that._isVertical = false;
			that._isHorizontal = true; 
			that._direction = that._horizontalDirection;
		}

		// DEBUG
		$('.debug2').text(
			'hd: ' + that._horizontalDirection + 
			'vd: ' + that._verticalDirection + 
			'rd: ' + that._direction
		);
		// DEBUG
	},

	_onTouchEnd: function(event) {
		var that = this;

		that._endTime = Number(new Date());
		that._eventTime = that._endTime - that._startTime;

		// Определяем события

		if (that._isFirstTouch) {
			that._eventName = 'tap';
		} else {
			that._eventName = 'swipe';
		}
	},

	_onTouchCancel: function(event) {
		// TODO: написать отельный обработчик для этог особытия
		this._onTouchEnd(event);
	},

	// Публичные методы для работы с библиотекой.

	// Признак того, что свайп вертикальный
	isVerticalDirection: function() {
		return this._isVertical;
	},

	// Признак того, что свайп горизонтальный
	isHorizontalDirection: function() {
		return this._isHorizontal;
	},

	// Вертикальное направление свайпа
	verticalDirection: function() {
		return this._verticalDirection;
	},

	// Горизонтальное направление свайпа
	horizontalDirection: function() {
		return this._horizontalDirection;
	},

	// Итоговое направление свайпа
	swipeDirection: function() {
		return this._direction;
	},

	// Время выполнения жеста
	eventTime: function() {
		return this._eventTime;
	},

	// Координаты первого касания
	// [X,Y]
	onTouchStartCoord: function() {
		return [this._onTouchStartPositionX, this._onTouchStartPositionY];
	},

	// Координаты движения пальца
	// [X,Y]
	// Если получать эти координаты во время события touchmove, 
	// можно получать мгновенные значения координат пальца
	onTouchMoveCoord: function() {
		return [this._touchArrayX[1], this._touchArrayY[1]];
	},

	// Координаты отрыва пальца от экрана
	// [X,Y]
	onTouchEndCoord: function() {
		return this.onTouchMoveCoord();
	},

	// Название события
	eventName: function() {
		return this._eventName;
	}	
};


