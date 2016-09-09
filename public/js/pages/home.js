window.onload = function () {
	new Vue({
		el: '#app',
		data: {
			hosts: [],
			tasks: [],
			sortType: 'project',
			sortReverse: 1,
		},
		ready: function() {
			this.fetchHosts();
		},
		methods: {
			fetchEvents: function() {
				this.$http.get('/tasks.json').then((response) => {
					this.$set('tasks', response.body);
					setTimeout(this.fetchHosts, 5000);
				}, (response) => {
					console.debug(response);
				});
			},
			fetchHosts: function() {
				this.$http.get('/hosts.json').then((response) => {
					this.$set('hosts', response.body);
					this.fetchEvents();
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
				var len = string.length;
				return string.substring(0, value) + (len > value ? '...' : '');
			},
			duration: function(number, format) {
				return moment.duration(number * 1000).format(format, { trim: false });
			},
			status: function(status) {
				return status == 1 ? 'Running' : 'Stopped';
			},
			caseInsensitiveOrderBy: function (arr, sortKey, reverse) {
				return arr;
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
