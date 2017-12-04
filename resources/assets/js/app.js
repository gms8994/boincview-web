import _ from 'lodash';
import Vue from 'vue'
import axios from 'axios';

import * as naturalSort from 'javascript-natural-sort';
import moment from 'moment';
import * as moment_duration from 'moment-duration-format';

window.onload = function () {

    const fetch_timeout = 1000;
    const refresh_interval = 5000;
    let overridden_timeouts = [];

    new Vue({
        el: '#app',
        data: {
            hosts: [],
            tasks: [],
            sortType: 'to_completion',
            sortReverse: 1,
        },
        ready: function() {
            this.fetchHosts();
        },
        methods: {
            fetchEventsForHost: function(host) {
                const that = this;

                let the_timeout = overridden_timeouts[host] || fetch_timeout;

                axios.get('/tasks.json?host=' + host, { timeout: the_timeout }).then((response) => {
                    var tasks = _(that.$get('tasks')).groupBy("node").value();
                    tasks[host] = response.data;

                    let task_set = [];

                    _(tasks).each(function(host) {
                        task_set = task_set.concat(host);
                    });

                    _(that.$get('hosts')).each(function(localhost) {
                        if (localhost.name == host && response.data.length > 0) {
                            localhost.active = true;
                        } else if (localhost.name == host && response.data.length == 0) {
                            localhost.active = false;
                        }
                    });

                    this.$set('tasks', task_set);
                    setTimeout(function() { that.fetchEventsForHost(host); }, refresh_interval);
                })
                .catch(function (error) {
                    if (error.message.match(/timeout of (\d+)ms exceeded/)) {
                        overridden_timeouts[host] = (overridden_timeouts[host] || fetch_timeout) + 1000;
                    }

                    _(that.$get('hosts')).each(function(localhost) {
                        if (localhost.name == host) {
                            localhost.active = false;
                        }
                    });
                    setTimeout(function() { that.fetchEventsForHost(host); }, refresh_interval);
                });
            },
            fetchHosts: function() {
                axios.get('/hosts.json').then((response) => {
                    const that = this;
                    _(response.data).each(function(host) {
                        that.fetchEventsForHost(host.name);
                    });
                    this.$set('hosts', response.data);
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
                // arr = convertArray(arr)
                if (!sortKey) {
                    return arr
                }
                let order = (reverse && reverse < 0) ? -1 : 1

                // sort on a copy to avoid mutating original array
                return arr.slice().sort(function (a, b) {
                    if (sortKey !== '$key') {
                        if (Vue.util.isObject(a) && '$value' in a) a = a.$value
                        if (Vue.util.isObject(b) && '$value' in b) b = b.$value
                    }
                    a = Vue.util.isObject(a) ? Vue.parsers.path.getPath(a, sortKey) : a;
                    b = Vue.util.isObject(b) ? Vue.parsers.path.getPath(b, sortKey) : b;

                    if (! isNaN(a) && ! isNaN(b)) {
                        return (a - b) * order;
                    }

                    let sorted = [ a, b ].sort(naturalSort);
                    return a === sorted[0] ? 0 : (a > sorted[0] ? order : -order);
                });
            }
        }
    });
};
