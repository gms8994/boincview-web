window.onload = function () {
	new Vue({
		el: '#app',
		data: {
			tasks: [],
			sortType: 'project',
			sortReverse: 1,
		},
		ready: function() {
			this.fetchEvents();
			setInterval(this.fetchEvents, 5000);
		},
		methods: {
			fetchEvents: function() {
				this.$http.get('/tasks.json').then((response) => {
					this.$set('tasks', response.body);
				}, (response) => {
					console.debug(response);
				});
			},
			moment: function () {
				return moment();
			}
		},
		filters: {
			truncate: function(string, value) {
				return string.substring(0, value) + '...';
			},
			duration: function(number, format) {
				return moment.duration(number * 1000).format(format, { trim: false });
			},
			caseInsensitiveOrderBy: function (arr, sortKey, reverse) {
				// arr = convertArray(arr)
				if (!sortKey) {
					return arr
				}
				var order = (reverse && reverse < 0) ? -1 : 1
				// sort on a copy to avoid mutating original array
				return arr.slice().sort(function (a, b) {
					if (sortKey !== '$key') {
						if (Vue.util.isObject(a) && '$value' in a) a = a.$value
						if (Vue.util.isObject(b) && '$value' in b) b = b.$value
					}
					console.log(a, sortKey, Vue.parsers.path.getPath(a, sortKey));
					a = Vue.util.isObject(a) ? Vue.parsers.path.getPath(a, sortKey) : a
					b = Vue.util.isObject(b) ? Vue.parsers.path.getPath(b, sortKey) : b

					// console.debug([ a, b ].sort());
					// console.debug([ a, b ].sort(naturalSort));
					// return [ a, b ].sort(naturalSort);
				})
			}
		}
	});
};
