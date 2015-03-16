(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/vadimivlev/Projects/_projects/govwiki.us/coffee/govmap.coffee":[function(require,module,exports){
var clear, geocode, geocode_addr, map, pinImage;

pinImage = new google.maps.MarkerImage('http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=Z|7777BB|FFFFFF', new google.maps.Size(21, 34), new google.maps.Point(0, 0), new google.maps.Point(10, 34));

map = new GMaps({
  el: '#govmap',
  lat: -12.043333,
  lng: -77.028333,
  zoom: 14
});

geocode_addr = function(addr, data) {
  return GMaps.geocode({
    address: addr,
    callback: function(results, status) {
      var latlng;
      if (status === 'OK') {
        latlng = results[0].geometry.location;
        map.setCenter(latlng.lat(), latlng.lng());
        map.addMarker({
          lat: latlng.lat(),
          lng: latlng.lng(),
          size: 'small',
          title: results[0].formatted_address,
          infoWindow: {
            content: results[0].formatted_address
          }
        });
        if (data) {
          map.addMarker({
            lat: data.latitude,
            lng: data.longitude,
            size: 'small',
            color: 'blue',
            icon: pinImage,
            title: data.latitude + " " + data.longitude,
            infoWindow: {
              content: data.latitude + " " + data.longitude
            }
          });
        }
        $('.govmap-found').html("<strong>FOUND: </strong>" + results[0].formatted_address);
      }
    }
  });
};

clear = function(s) {
  if (s.match(/ box /i)) {
    return '';
  } else {
    return s;
  }
};

geocode = function(data) {
  var addr;
  addr = (clear(data.address1)) + " " + (clear(data.address2)) + ", " + data.city + ", " + data.state + " " + data.zip + ", USA";
  $('#govaddress').val(addr);
  return geocode_addr(addr, data);
};

"1 Doctor Carlton B Goodlett Place, San Francisco, CA 94102, USA";

module.exports = {
  geocode: geocode,
  gocode_addr: geocode_addr
};



},{}],"/Users/vadimivlev/Projects/_projects/govwiki.us/coffee/govselector.coffee":[function(require,module,exports){
var GovSelector, query_matcher,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

query_matcher = require('./querymatcher.coffee');

GovSelector = (function() {
  GovSelector.prototype.on_selected = function(evt, data, name) {};

  function GovSelector(html_selector, docs_url, num_items) {
    this.html_selector = html_selector;
    this.num_items = num_items;
    this.startSuggestion = bind(this.startSuggestion, this);
    $.ajax({
      url: docs_url,
      dataType: 'json',
      cache: true,
      success: this.startSuggestion
    });
  }

  GovSelector.prototype.suggestionTemplate = Handlebars.compile("<div class=\"sugg-box\">\n<p><span class=\"sugg-main\">{{{gov_name}}}</span> \n<span class=\"sugg-small\">{{{state}}} &nbsp;{{{gov_type}}}</span>\n</p>\n</div>");

  GovSelector.prototype.entered_value = "";

  GovSelector.prototype.startSuggestion = function(govs) {
    $('.typeahead').keyup((function(_this) {
      return function(event) {
        return _this.entered_value = $(event.target).val();
      };
    })(this));
    $(this.html_selector).attr('placeholder', 'GOVERNMENT NAME');
    $(this.html_selector).typeahead({
      hint: false,
      highlight: false,
      minLength: 1
    }, {
      name: 'gov_name',
      displayKey: 'gov_name',
      source: query_matcher(govs, this.num_items),
      templates: {
        suggestion: this.suggestionTemplate
      }
    }).on('typeahead:selected', (function(_this) {
      return function(evt, data, name) {
        $('.typeahead').typeahead('val', _this.entered_value);
        return _this.on_selected(evt, data, name);
      };
    })(this)).on('typeahead:cursorchanged', (function(_this) {
      return function(evt, data, name) {
        return $('.typeahead').val(_this.entered_value);
      };
    })(this));
  };

  return GovSelector;

})();

module.exports = GovSelector;



},{"./querymatcher.coffee":"/Users/vadimivlev/Projects/_projects/govwiki.us/coffee/querymatcher.coffee"}],"/Users/vadimivlev/Projects/_projects/govwiki.us/coffee/jquery.govselector.coffee":[function(require,module,exports){
(function($) {
  $.govselector = function(el, options) {
    var base, blur, delay, onkeyup;
    base = this;
    base.$el = $(el);
    base.el = el;
    base.$el.data('govselector', base);
    delay = (function() {
      var timer;
      timer = 0;
      return function(callback, ms) {
        clearTimeout(timer);
        timer = setTimeout(callback, ms);
      };
    })();
    onkeyup = function(event) {
      switch (event.which) {
        case 13:
          event.preventDefault();
          $('.typeahead').typeahead('val', base.$el.val());
          $('.typeahead').typeahead('open');
          break;
        case 27:
          $('.typeahead').typeahead('close');
          break;
        case 38:
          break;
        case 40:
          break;
        default:
          $('.typeahead').typeahead('val', base.$el.val());
          $('.typeahead').typeahead('open');
      }
      console.log(event.which);
    };
    blur = function(event) {
      return console.log('blur');
    };
    base.init = function() {
      base.options = $.extend({}, $.govselector.defaultOptions, options);
      base.$el.css('background-color', 'white');
      base.$el.keyup(onkeyup);
      base.$el.blur(onblur);
    };
    base.init();
  };
  $.govselector.defaultOptions = {
    rows: 5,
    template: '{{}}'
  };
  $.fn.govselector = function(options) {
    return this.each(function() {
      new $.govselector(this, options);
    });
  };
  $.fn.getgovselector = function() {
    this.data('govselector');
  };
})(jQuery);



},{}],"/Users/vadimivlev/Projects/_projects/govwiki.us/coffee/main.coffee":[function(require,module,exports){

/*
file: main.coffe -- The entry -----------------------------------------------------------------------------------
  :
gov_finder = new GovFinder
gov_details = new GovDetails
gov_finder.on_select = gov_details.show
-----------------------------------------------------------------------------------------------------------------
 */
var GovSelector, Templates2, _jqgs, activate_tab, active_tab, get_record, gov_selector, govmap, templates;

GovSelector = require('./govselector.coffee');

_jqgs = require('./jquery.govselector.coffee');

Templates2 = require('./templates2.coffee');

govmap = require('./govmap.coffee');

gov_selector = new GovSelector('.typeahead', 'data/h_types.json', 7);

templates = new Templates2;

active_tab = "";

window.remember_tab = function(name) {
  return active_tab = name;
};

window.geocode_addr = function(input_selector) {
  return govmap.gocode_addr($(input_selector).val());
};

activate_tab = function() {
  return $("#fieldTabs a[href='#" + active_tab + "']").tab('show');
};

gov_selector.on_selected = function(evt, data, name) {
  $('#details').html(templates.get_html(0, data));
  activate_tab();
  get_record("inc_id:" + data["inc_id"]);
};

get_record = function(query) {
  return $.ajax({
    url: "https://api.mongolab.com/api/1/databases/govwiki/collections/govs/?q={" + query + "}&f={_id:0}&l=1&apiKey=0Y5X_Qk2uOJRdHJWJKSRWk6l6JqVTS2y",
    dataType: 'json',
    cache: true,
    success: function(data) {
      if (data.length) {
        $('#details').html(templates.get_html(0, data[0]));
        activate_tab();
        $('#maparea').css('visibility', 'visible');
        govmap.geocode(data[0]);
      }
    }
  });
};

$('#maparea').css('visibility', 'hidden');

templates.load_template("tabs", "config/tablayout.json");



},{"./govmap.coffee":"/Users/vadimivlev/Projects/_projects/govwiki.us/coffee/govmap.coffee","./govselector.coffee":"/Users/vadimivlev/Projects/_projects/govwiki.us/coffee/govselector.coffee","./jquery.govselector.coffee":"/Users/vadimivlev/Projects/_projects/govwiki.us/coffee/jquery.govselector.coffee","./templates2.coffee":"/Users/vadimivlev/Projects/_projects/govwiki.us/coffee/templates2.coffee"}],"/Users/vadimivlev/Projects/_projects/govwiki.us/coffee/querymatcher.coffee":[function(require,module,exports){
var QueryMather, full_trim, get_words, get_words_regs, select_text, strip, strongify;

QueryMather = function(docs, num_items) {
  if (num_items == null) {
    num_items = 5;
  }
  return function(q, cb) {
    var d, j, len, matches, ref, regs, test_string, words;
    test_string = function(s, regs) {
      var j, len, r;
      for (j = 0, len = regs.length; j < len; j++) {
        r = regs[j];
        if (!r.test(s)) {
          return false;
        }
      }
      return true;
    };
    ref = get_words_regs(q), words = ref[0], regs = ref[1];
    matches = [];
    for (j = 0, len = docs.length; j < len; j++) {
      d = docs[j];
      if (matches.length >= num_items) {
        break;
      }
      if (test_string(d.gov_name, regs)) {
        matches.push($.extend({}, d));
      }
    }
    select_text(matches, words, regs);
    cb(matches);
  };
};

select_text = function(clones, words, regs) {
  var d, j, len;
  for (j = 0, len = clones.length; j < len; j++) {
    d = clones[j];
    d.gov_name = strongify(d.gov_name, words, regs);
  }
  return clones;
};

strongify = function(s, words, regs) {
  regs.forEach(function(r, i) {
    return s = s.replace(r, "<b>" + words[i] + "</b>");
  });
  return s;
};

strip = function(s) {
  return s.replace(/<[^<>]*>/g, '');
};

full_trim = function(s) {
  var ss;
  ss = s.trim('' + s);
  return ss = ss.replace(/ +/g, ' ');
};

get_words = function(str) {
  return full_trim(str).split(' ');
};

get_words_regs = function(str) {
  var regs, words;
  words = get_words(str);
  regs = words.map(function(w) {
    return new RegExp("" + w, 'ig');
  });
  return [words, regs];
};

module.exports = QueryMather;



},{}],"/Users/vadimivlev/Projects/_projects/govwiki.us/coffee/templates2.coffee":[function(require,module,exports){

/*
 * file: templates2.coffee ----------------------------------------------------------------------
#
 * Class to manage templates and render data on html page.
#
 * The main method : render(data), get_html(data)
#-------------------------------------------------------------------------------------------------
 */
var Templates2, add_other_tab_to_layout, fieldNames, get_layout_fields, get_record_fields, get_unmentioned_fields, load_field_names, render_field, render_field_name, render_field_value, render_fields, render_tabs, under;

fieldNames = {};

load_field_names = function(url) {
  return $.ajax({
    url: url,
    dataType: 'json',
    cache: true,
    success: (function(_this) {
      return function(fieldnames_json) {
        fieldNames = fieldnames_json;
      };
    })(this),
    error: function(e) {
      return console.log(e);
    }
  });
};

load_field_names("config/fieldnames.json");

render_field_value = function(n, data) {
  var v;
  v = data[n];
  if (n === "web_site") {
    return "<a target='_blank' href='" + v + "'>" + v + "</a>";
  } else {
    return v;
  }
};

render_field_name = function(fName) {
  var s;
  if (fieldNames[fName] != null) {
    return fieldNames[fName];
  }
  s = fName.replace(/_/g, " ");
  s = s.charAt(0).toUpperCase() + s.substring(1);
  return s;
};

render_field = function(fName, data) {
  var fValue;
  if (!(fValue = data[fName])) {
    return '';
  }
  return "<div>\n    <span class='f-nam'>" + (render_field_name(fName)) + "</span>\n    <span class='f-val'>" + (render_field_value(fName, data)) + "</span>\n</div>";
};

render_fields = function(fields, data) {
  var f;
  return ((function() {
    var j, len, results;
    results = [];
    for (j = 0, len = fields.length; j < len; j++) {
      f = fields[j];
      results.push(render_field(f, data));
    }
    return results;
  })()).join('');
};

under = function(s) {
  return s.replace(/ /g, '_');
};

render_tabs = function(initial_layout, data) {
  var active, h, i, j, k, layout, len, len1, tab;
  layout = add_other_tab_to_layout(initial_layout, data);
  h = '<div role="tabpanel" >';
  h += '<ul id="fieldTabs" class="nav nav-tabs" role="tablist">';
  for (i = j = 0, len = layout.length; j < len; i = ++j) {
    tab = layout[i];
    active = i > 0 ? '' : 'active';
    h += "<li role=\"presentation\" class=\"" + active + "\" onclick=\"remember_tab('" + (under(tab.name)) + "')\">\n  <a href=\"#" + (under(tab.name)) + "\" aria-controls=\"home\" role=\"tab\" data-toggle=\"tab\">\n  " + tab.name + "\n  </a>\n</li>";
  }
  h += '</ul>';
  h += '<div class="tab-content">';
  for (i = k = 0, len1 = layout.length; k < len1; i = ++k) {
    tab = layout[i];
    active = i > 0 ? '' : 'active';
    h += "<div role=\"tabpanel\" class=\"tab-pane " + active + "\" id=\"" + (under(tab.name)) + "\" style=\"padding-top: 40px;\">\n    " + (render_fields(tab.fields, data)) + "\n</div>";
  }
  h += '</div>';
  h += '</div>';
  return h;
};

get_layout_fields = function(la) {
  var f, field, j, k, len, len1, ref, t;
  f = {};
  for (j = 0, len = la.length; j < len; j++) {
    t = la[j];
    ref = t.fields;
    for (k = 0, len1 = ref.length; k < len1; k++) {
      field = ref[k];
      f[field] = 1;
    }
  }
  return f;
};

get_record_fields = function(r) {
  var f, field_name;
  f = {};
  for (field_name in r) {
    f[field_name] = 1;
  }
  return f;
};

get_unmentioned_fields = function(la, r) {
  var f, layout_fields, record_fields, unmentioned_fields;
  layout_fields = get_layout_fields(la);
  record_fields = get_record_fields(r);
  unmentioned_fields = [];
  for (f in record_fields) {
    if (!layout_fields[f]) {
      unmentioned_fields.push(f);
    }
  }
  return unmentioned_fields;
};

add_other_tab_to_layout = function(layout, data) {
  var l, t;
  if (layout == null) {
    layout = [];
  }
  l = $.extend(true, [], layout);
  t = {
    name: "Other",
    fields: get_unmentioned_fields(l, data)
  };
  l.push(t);
  return l;
};

Templates2 = (function() {
  Templates2.list = void 0;

  function Templates2() {
    this.list = [];
  }

  Templates2.prototype.add_template = function(layout_name, layout_json) {
    return this.list.push({
      name: layout_name,
      render: function(dat) {
        return render_tabs(layout_json, dat);
      }
    });
  };

  Templates2.prototype.load_template = function(template_name, url) {
    return $.ajax({
      url: url,
      dataType: 'json',
      cache: true,
      success: (function(_this) {
        return function(template_json) {
          _this.add_template(template_name, template_json);
        };
      })(this)
    });
  };

  Templates2.prototype.get_names = function() {
    var j, len, ref, results, t;
    ref = this.list;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      t = ref[j];
      results.push(t.name);
    }
    return results;
  };

  Templates2.prototype.get_index_by_name = function(name) {
    var i, j, len, ref, t;
    ref = this.list;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      t = ref[i];
      if (t.name === name) {
        return i;
      }
    }
    return -1;
  };

  Templates2.prototype.get_html = function(ind, data) {
    if (ind === -1) {
      return "";
    }
    if (this.list[ind]) {
      return this.list[ind].render(data);
    } else {
      return "";
    }
  };

  return Templates2;

})();

module.exports = Templates2;



},{}]},{},["/Users/vadimivlev/Projects/_projects/govwiki.us/coffee/main.coffee"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvdmFkaW1pdmxldi9Qcm9qZWN0cy9fcHJvamVjdHMvZ292d2lraS51cy9jb2ZmZWUvZ292bWFwLmNvZmZlZSIsIi9Vc2Vycy92YWRpbWl2bGV2L1Byb2plY3RzL19wcm9qZWN0cy9nb3Z3aWtpLnVzL2NvZmZlZS9nb3ZzZWxlY3Rvci5jb2ZmZWUiLCIvVXNlcnMvdmFkaW1pdmxldi9Qcm9qZWN0cy9fcHJvamVjdHMvZ292d2lraS51cy9jb2ZmZWUvanF1ZXJ5LmdvdnNlbGVjdG9yLmNvZmZlZSIsIi9Vc2Vycy92YWRpbWl2bGV2L1Byb2plY3RzL19wcm9qZWN0cy9nb3Z3aWtpLnVzL2NvZmZlZS9tYWluLmNvZmZlZSIsIi9Vc2Vycy92YWRpbWl2bGV2L1Byb2plY3RzL19wcm9qZWN0cy9nb3Z3aWtpLnVzL2NvZmZlZS9xdWVyeW1hdGNoZXIuY29mZmVlIiwiL1VzZXJzL3ZhZGltaXZsZXYvUHJvamVjdHMvX3Byb2plY3RzL2dvdndpa2kudXMvY29mZmVlL3RlbXBsYXRlczIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSwyQ0FBQTs7QUFBQSxRQUFBLEdBQWUsSUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQWIsQ0FDYiwrRUFEYSxFQUVULElBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFiLENBQW1CLEVBQW5CLEVBQXVCLEVBQXZCLENBRlMsRUFHVCxJQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBYixDQUFvQixDQUFwQixFQUF1QixDQUF2QixDQUhTLEVBSVQsSUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQWIsQ0FBb0IsRUFBcEIsRUFBd0IsRUFBeEIsQ0FKUyxDQUFmLENBQUE7O0FBQUEs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QXBKRixDQUFBOztBQUFBLE1BNkxNLENBQUMsT0FBUCxHQUFpQixVQTdMakIsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJwaW5JbWFnZSA9IG5ldyAoZ29vZ2xlLm1hcHMuTWFya2VySW1hZ2UpKFxuICAnaHR0cDovL2NoYXJ0LmFwaXMuZ29vZ2xlLmNvbS9jaGFydD9jaHN0PWRfbWFwX3Bpbl9sZXR0ZXImY2hsZD1afDc3NzdCQnxGRkZGRkYnICxcbiAgbmV3IChnb29nbGUubWFwcy5TaXplKSgyMSwgMzQpLFxuICBuZXcgKGdvb2dsZS5tYXBzLlBvaW50KSgwLCAwKSxcbiAgbmV3IChnb29nbGUubWFwcy5Qb2ludCkoMTAsIDM0KVxuICApXG5cblxubWFwID0gbmV3IEdNYXBzXG4gIGVsOiAnI2dvdm1hcCdcbiAgbGF0OiAtMTIuMDQzMzMzXG4gIGxuZzogLTc3LjAyODMzM1xuICB6b29tOjE0XG5cbmdlb2NvZGVfYWRkciA9IChhZGRyLGRhdGEpIC0+XG4gIEdNYXBzLmdlb2NvZGVcbiAgICBhZGRyZXNzOiBhZGRyXG4gICAgY2FsbGJhY2s6IChyZXN1bHRzLCBzdGF0dXMpIC0+XG4gICAgICBpZiBzdGF0dXMgPT0gJ09LJ1xuICAgICAgICBsYXRsbmcgPSByZXN1bHRzWzBdLmdlb21ldHJ5LmxvY2F0aW9uXG4gICAgICAgIG1hcC5zZXRDZW50ZXIgbGF0bG5nLmxhdCgpLCBsYXRsbmcubG5nKClcbiAgICAgICAgbWFwLmFkZE1hcmtlclxuICAgICAgICAgIGxhdDogbGF0bG5nLmxhdCgpXG4gICAgICAgICAgbG5nOiBsYXRsbmcubG5nKClcbiAgICAgICAgICBzaXplOiAnc21hbGwnXG4gICAgICAgICAgdGl0bGU6IHJlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3NcbiAgICAgICAgICBpbmZvV2luZG93OlxuICAgICAgICAgICAgY29udGVudDogcmVzdWx0c1swXS5mb3JtYXR0ZWRfYWRkcmVzc1xuICAgICAgICBcbiAgICAgICAgaWYgZGF0YVxuICAgICAgICAgIG1hcC5hZGRNYXJrZXJcbiAgICAgICAgICAgIGxhdDogZGF0YS5sYXRpdHVkZVxuICAgICAgICAgICAgbG5nOiBkYXRhLmxvbmdpdHVkZVxuICAgICAgICAgICAgc2l6ZTogJ3NtYWxsJ1xuICAgICAgICAgICAgY29sb3I6ICdibHVlJ1xuICAgICAgICAgICAgaWNvbjogcGluSW1hZ2VcbiAgICAgICAgICAgIHRpdGxlOiAgXCIje2RhdGEubGF0aXR1ZGV9ICN7ZGF0YS5sb25naXR1ZGV9XCJcbiAgICAgICAgICAgIGluZm9XaW5kb3c6XG4gICAgICAgICAgICAgIGNvbnRlbnQ6IFwiI3tkYXRhLmxhdGl0dWRlfSAje2RhdGEubG9uZ2l0dWRlfVwiXG4gICAgICAgICAgICBcbiAgICAgICAgJCgnLmdvdm1hcC1mb3VuZCcpLmh0bWwgXCI8c3Ryb25nPkZPVU5EOiA8L3N0cm9uZz4je3Jlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3N9XCJcbiAgICAgIHJldHVyblxuXG5jbGVhcj0ocyktPlxuICByZXR1cm4gaWYgcy5tYXRjaCgvIGJveCAvaSkgdGhlbiAnJyBlbHNlIHNcblxuXG5cbmdlb2NvZGUgPSAoZGF0YSkgLT5cbiAgYWRkciA9IFwiI3tjbGVhcihkYXRhLmFkZHJlc3MxKX0gI3tjbGVhcihkYXRhLmFkZHJlc3MyKX0sICN7ZGF0YS5jaXR5fSwgI3tkYXRhLnN0YXRlfSAje2RhdGEuemlwfSwgVVNBXCJcbiAgJCgnI2dvdmFkZHJlc3MnKS52YWwoYWRkcilcbiAgZ2VvY29kZV9hZGRyIGFkZHIsIGRhdGFcblxuXCIxIERvY3RvciBDYXJsdG9uIEIgR29vZGxldHQgUGxhY2UsIFNhbiBGcmFuY2lzY28sIENBIDk0MTAyLCBVU0FcIlxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGdlb2NvZGU6IGdlb2NvZGVcbiAgZ29jb2RlX2FkZHI6IGdlb2NvZGVfYWRkclxuXG4iLCJxdWVyeV9tYXRjaGVyID0gcmVxdWlyZSgnLi9xdWVyeW1hdGNoZXIuY29mZmVlJylcblxuY2xhc3MgR292U2VsZWN0b3JcbiAgXG4gICMgc3R1YiBvZiBhIGNhbGxiYWNrIHRvIGVudm9rZSB3aGVuIHRoZSB1c2VyIHNlbGVjdHMgc29tZXRoaW5nXG4gIG9uX3NlbGVjdGVkOiAoZXZ0LCBkYXRhLCBuYW1lKSAtPlxuXG5cbiAgY29uc3RydWN0b3I6IChAaHRtbF9zZWxlY3RvciwgZG9jc191cmwsIEBudW1faXRlbXMpIC0+XG4gICAgJC5hamF4XG4gICAgICB1cmw6IGRvY3NfdXJsXG4gICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICBjYWNoZTogdHJ1ZVxuICAgICAgc3VjY2VzczogQHN0YXJ0U3VnZ2VzdGlvblxuICAgICAgXG5cblxuXG4gIHN1Z2dlc3Rpb25UZW1wbGF0ZSA6IEhhbmRsZWJhcnMuY29tcGlsZShcIlwiXCJcbiAgICA8ZGl2IGNsYXNzPVwic3VnZy1ib3hcIj5cbiAgICA8cD48c3BhbiBjbGFzcz1cInN1Z2ctbWFpblwiPnt7e2dvdl9uYW1lfX19PC9zcGFuPiBcbiAgICA8c3BhbiBjbGFzcz1cInN1Z2ctc21hbGxcIj57e3tzdGF0ZX19fSAmbmJzcDt7e3tnb3ZfdHlwZX19fTwvc3Bhbj5cbiAgICA8L3A+XG4gICAgPC9kaXY+XCJcIlwiKVxuXG4gIGVudGVyZWRfdmFsdWU6XCJcIlxuXG4gIHN0YXJ0U3VnZ2VzdGlvbiA6IChnb3ZzKSA9PlxuICAgIFxuICAgICQoJy50eXBlYWhlYWQnKS5rZXl1cCAoZXZlbnQpID0+XG4gICAgICBAZW50ZXJlZF92YWx1ZSA9ICQoZXZlbnQudGFyZ2V0KS52YWwoKVxuICAgIFxuICAgICQoQGh0bWxfc2VsZWN0b3IpLmF0dHIgJ3BsYWNlaG9sZGVyJywgJ0dPVkVSTk1FTlQgTkFNRSdcbiAgICAkKEBodG1sX3NlbGVjdG9yKS50eXBlYWhlYWQoXG4gICAgICAgIGhpbnQ6IGZhbHNlXG4gICAgICAgIGhpZ2hsaWdodDogZmFsc2VcbiAgICAgICAgbWluTGVuZ3RoOiAxXG4gICAgICAsXG4gICAgICAgIG5hbWU6ICdnb3ZfbmFtZSdcbiAgICAgICAgZGlzcGxheUtleTogJ2dvdl9uYW1lJ1xuICAgICAgICBzb3VyY2U6IHF1ZXJ5X21hdGNoZXIoZ292cywgQG51bV9pdGVtcylcbiAgICAgICAgI3NvdXJjZTogYmxvb2Rob3VuZC50dEFkYXB0ZXIoKVxuICAgICAgICB0ZW1wbGF0ZXM6IHN1Z2dlc3Rpb246IEBzdWdnZXN0aW9uVGVtcGxhdGVcbiAgICApXG4gICAgLm9uICd0eXBlYWhlYWQ6c2VsZWN0ZWQnLCAgKGV2dCwgZGF0YSwgbmFtZSkgPT5cbiAgICAgICAgJCgnLnR5cGVhaGVhZCcpLnR5cGVhaGVhZCAndmFsJywgQGVudGVyZWRfdmFsdWVcbiAgICAgICAgQG9uX3NlbGVjdGVkKGV2dCwgZGF0YSwgbmFtZSlcbiAgIFxuICAgIC5vbiAndHlwZWFoZWFkOmN1cnNvcmNoYW5nZWQnLCAoZXZ0LCBkYXRhLCBuYW1lKSA9PlxuICAgICAgICAkKCcudHlwZWFoZWFkJykudmFsIEBlbnRlcmVkX3ZhbHVlXG4gICAgXG5cbiAgICByZXR1cm5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cz1Hb3ZTZWxlY3RvclxuXG5cbiIsIigoJCkgLT5cblxuICAkLmdvdnNlbGVjdG9yID0gKGVsLCBvcHRpb25zKSAtPlxuXG4gICAgIyBUbyBhdm9pZCBzY29wZSBpc3N1ZXMsIHVzZSAnYmFzZScgaW5zdGVhZCBvZiAndGhpcydcbiAgICAjIHRvIHJlZmVyZW5jZSB0aGlzIGNsYXNzIGZyb20gaW50ZXJuYWwgZXZlbnRzIGFuZCBmdW5jdGlvbnMuXG4gICAgYmFzZSA9IHRoaXNcbiAgICBcbiAgICBcbiAgICAjIEFjY2VzcyB0byBqUXVlcnkgYW5kIERPTSB2ZXJzaW9ucyBvZiBlbGVtZW50XG4gICAgYmFzZS4kZWwgPSAkKGVsKVxuICAgIGJhc2UuZWwgPSBlbFxuICAgIFxuICAgIFxuICAgICMgQWRkIGEgcmV2ZXJzZSByZWZlcmVuY2UgdG8gdGhlIERPTSBvYmplY3RcbiAgICBiYXNlLiRlbC5kYXRhICdnb3ZzZWxlY3RvcicsIGJhc2VcblxuICAgICMgZGVsYXkgdXNhZ2VcbiAgICAjJCgnaW5wdXQnKS5rZXl1cCAtPlxuICAgICMgIGRlbGF5ICgtPiBhbGVydCAnVGltZSBlbGFwc2VkISc7IHJldHVybiksIDEwMDBcbiAgICAjICByZXR1cm5cbiAgICAgIFxuICAgIGRlbGF5ID0gZG8gLT5cbiAgICAgIHRpbWVyID0gMFxuICAgICAgKGNhbGxiYWNrLCBtcykgLT5cbiAgICAgICAgY2xlYXJUaW1lb3V0IHRpbWVyXG4gICAgICAgIHRpbWVyID0gc2V0VGltZW91dChjYWxsYmFjaywgbXMpXG4gICAgICAgIHJldHVyblxuICAgIFxuICAgIG9ua2V5dXAgPSAoZXZlbnQpIC0+XG4gICAgICBzd2l0Y2ggIGV2ZW50LndoaWNoXG4gICAgICAgICMgRW50ZXJcbiAgICAgICAgd2hlbiAxM1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAkKCcudHlwZWFoZWFkJykudHlwZWFoZWFkICd2YWwnLCBiYXNlLiRlbC52YWwoKVxuICAgICAgICAgICQoJy50eXBlYWhlYWQnKS50eXBlYWhlYWQgJ29wZW4nXG4gICAgICAgICMgRXNjXG4gICAgICAgIHdoZW4gMjdcbiAgICAgICAgICAkKCcudHlwZWFoZWFkJykudHlwZWFoZWFkICdjbG9zZSdcbiAgICAgICAgIyBVcFxuICAgICAgICB3aGVuIDM4IHRoZW5cbiAgICAgICAgIyBEb3duXG4gICAgICAgIHdoZW4gNDAgdGhlblxuICAgICAgICBlbHNlXG4gICAgICAgICAgJCgnLnR5cGVhaGVhZCcpLnR5cGVhaGVhZCAndmFsJywgYmFzZS4kZWwudmFsKClcbiAgICAgICAgICAkKCcudHlwZWFoZWFkJykudHlwZWFoZWFkICdvcGVuJ1xuICAgICAgI2V2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIGNvbnNvbGUubG9nIGV2ZW50LndoaWNoXG4gICAgICByZXR1cm5cblxuICAgIGJsdXIgPSAoZXZlbnQpIC0+XG4gICAgICBjb25zb2xlLmxvZyAnYmx1cidcbiAgICBcbiAgICBiYXNlLmluaXQgPSAtPlxuICAgICAgYmFzZS5vcHRpb25zID0gJC5leHRlbmQoe30sICQuZ292c2VsZWN0b3IuZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpXG4gICAgICAjIFB1dCB5b3VyIGluaXRpYWxpemF0aW9uIGNvZGUgaGVyZVxuICAgICAgYmFzZS4kZWwuY3NzICdiYWNrZ3JvdW5kLWNvbG9yJywgJ3doaXRlJ1xuICAgICAgYmFzZS4kZWwua2V5dXAgb25rZXl1cFxuICAgICAgYmFzZS4kZWwuYmx1ciBvbmJsdXJcblxuICAgICAgcmV0dXJuXG5cbiAgICBcbiAgICAjIFNhbXBsZSBGdW5jdGlvbiwgVW5jb21tZW50IHRvIHVzZVxuICAgICMgYmFzZS5mdW5jdGlvbk5hbWUgPSBmdW5jdGlvbihwYXJhbWF0ZXJzKXtcbiAgICAjXG4gICAgIyB9O1xuICAgIFxuICAgIFxuICAgICMgUnVuIGluaXRpYWxpemVyXG4gICAgYmFzZS5pbml0KClcbiAgICByZXR1cm5cblxuICAgIFxuICAkLmdvdnNlbGVjdG9yLmRlZmF1bHRPcHRpb25zID1cbiAgICByb3dzOiA1XG4gICAgdGVtcGxhdGU6ICd7e319J1xuXG4gICAgXG4gICQuZm4uZ292c2VsZWN0b3IgPSAob3B0aW9ucykgLT5cbiAgICBAZWFjaCAtPlxuICAgICAgbmV3ICgkLmdvdnNlbGVjdG9yKSh0aGlzLCBvcHRpb25zKVxuICAgICAgcmV0dXJuXG5cbiAgICBcbiAgIyBUaGlzIGZ1bmN0aW9uIGJyZWFrcyB0aGUgY2hhaW4sIGJ1dCByZXR1cm5zXG4gICMgdGhlIGdvdnNlbGVjdG9yIGlmIGl0IGhhcyBiZWVuIGF0dGFjaGVkIHRvIHRoZSBvYmplY3QuXG4gICQuZm4uZ2V0Z292c2VsZWN0b3IgPSAtPlxuICAgIEBkYXRhICdnb3ZzZWxlY3RvcidcbiAgICByZXR1cm5cblxuICAgIFxuICByZXR1cm5cbikgalF1ZXJ5XG4iLCIjIyNcbmZpbGU6IG1haW4uY29mZmUgLS0gVGhlIGVudHJ5IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIDpcbmdvdl9maW5kZXIgPSBuZXcgR292RmluZGVyXG5nb3ZfZGV0YWlscyA9IG5ldyBHb3ZEZXRhaWxzXG5nb3ZfZmluZGVyLm9uX3NlbGVjdCA9IGdvdl9kZXRhaWxzLnNob3dcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIyNcblxuR292U2VsZWN0b3IgPSByZXF1aXJlICcuL2dvdnNlbGVjdG9yLmNvZmZlZSdcbl9qcWdzICAgICAgID0gcmVxdWlyZSAnLi9qcXVlcnkuZ292c2VsZWN0b3IuY29mZmVlJ1xuVGVtcGxhdGVzMiAgICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMyLmNvZmZlZSdcbmdvdm1hcCAgICAgID0gcmVxdWlyZSAnLi9nb3ZtYXAuY29mZmVlJ1xuXG5cblxuZ292X3NlbGVjdG9yID0gbmV3IEdvdlNlbGVjdG9yICcudHlwZWFoZWFkJywgJ2RhdGEvaF90eXBlcy5qc29uJywgN1xudGVtcGxhdGVzID0gbmV3IFRlbXBsYXRlczJcbmFjdGl2ZV90YWI9XCJcIlxuXG53aW5kb3cucmVtZW1iZXJfdGFiID0obmFtZSktPiBhY3RpdmVfdGFiID0gbmFtZVxuXG53aW5kb3cuZ2VvY29kZV9hZGRyID0gKGlucHV0X3NlbGVjdG9yKS0+IGdvdm1hcC5nb2NvZGVfYWRkciAkKGlucHV0X3NlbGVjdG9yKS52YWwoKVxuXG5hY3RpdmF0ZV90YWIgPSgpIC0+XG4gICQoXCIjZmllbGRUYWJzIGFbaHJlZj0nIyN7YWN0aXZlX3RhYn0nXVwiKS50YWIoJ3Nob3cnKVxuXG5cbmdvdl9zZWxlY3Rvci5vbl9zZWxlY3RlZCA9IChldnQsIGRhdGEsIG5hbWUpIC0+XG4gICNyZW5kZXJEYXRhICcjZGV0YWlscycsIGRhdGFcbiAgJCgnI2RldGFpbHMnKS5odG1sIHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBkYXRhKVxuICBhY3RpdmF0ZV90YWIoKVxuICBnZXRfcmVjb3JkIFwiaW5jX2lkOiN7ZGF0YVtcImluY19pZFwiXX1cIlxuICByZXR1cm5cblxuXG5nZXRfcmVjb3JkID0gKHF1ZXJ5KSAtPlxuICAkLmFqYXhcbiAgICB1cmw6IFwiaHR0cHM6Ly9hcGkubW9uZ29sYWIuY29tL2FwaS8xL2RhdGFiYXNlcy9nb3Z3aWtpL2NvbGxlY3Rpb25zL2dvdnMvP3E9eyN7cXVlcnl9fSZmPXtfaWQ6MH0mbD0xJmFwaUtleT0wWTVYX1FrMnVPSlJkSEpXSktTUldrNmw2SnFWVFMyeVwiXG4gICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgIGNhY2hlOiB0cnVlXG4gICAgc3VjY2VzczogKGRhdGEpIC0+XG4gICAgICAjaWYgZGF0YS5sZW5ndGggdGhlbiByZW5kZXJEYXRhICcjZGV0YWlscycsICBkYXRhWzBdXG4gICAgICBpZiBkYXRhLmxlbmd0aFxuICAgICAgICAkKCcjZGV0YWlscycpLmh0bWwgdGVtcGxhdGVzLmdldF9odG1sKDAsIGRhdGFbMF0pXG4gICAgICAgIGFjdGl2YXRlX3RhYigpXG4gICAgICAgICQoJyNtYXBhcmVhJykuY3NzKCd2aXNpYmlsaXR5JywndmlzaWJsZScpXG4gICAgICAgIGdvdm1hcC5nZW9jb2RlIGRhdGFbMF1cbiAgICAgIHJldHVyblxuXG5cblxuXG5cbiQoJyNtYXBhcmVhJykuY3NzKCd2aXNpYmlsaXR5JywnaGlkZGVuJylcblxuXG50ZW1wbGF0ZXMubG9hZF90ZW1wbGF0ZSBcInRhYnNcIiwgXCJjb25maWcvdGFibGF5b3V0Lmpzb25cIlxuIiwiXG5cblxuIyBUYWtlcyBhbiBhcnJheSBvZiBkb2NzIHRvIHNlYXJjaCBpbi5cbiMgUmV0dXJucyBhIGZ1bmN0aW9ucyB0aGF0IHRha2VzIDIgcGFyYW1zIFxuIyBxIC0gcXVlcnkgc3RyaW5nIGFuZCBcbiMgY2IgLSBjYWxsYmFjayB0aGF0IHdpbGwgYmUgY2FsbGVkIHdoZW4gdGhlIHNlYXJjaCBpcyBkb25lLlxuIyBjYiByZXR1cm5zIGFuIGFycmF5IG9mIG1hdGNoaW5nIGRvY3VtZW50cy5cbiMgbXVtX2l0ZW1zIC0gbWF4IG51bWJlciBvZiBmb3VuZCBpdGVtcyB0byBzaG93XG5RdWVyeU1hdGhlciA9IChkb2NzLCBudW1faXRlbXM9NSkgLT5cbiAgKHEsIGNiKSAtPlxuICAgIHRlc3Rfc3RyaW5nID0ocywgcmVncykgLT5cbiAgICAgIChpZiBub3Qgci50ZXN0KHMpIHRoZW4gcmV0dXJuIGZhbHNlKSAgZm9yIHIgaW4gcmVnc1xuICAgICAgcmV0dXJuIHRydWVcblxuICAgIFt3b3JkcyxyZWdzXSA9IGdldF93b3Jkc19yZWdzIHFcbiAgICBtYXRjaGVzID0gW11cbiAgICAjIGl0ZXJhdGUgdGhyb3VnaCB0aGUgcG9vbCBvZiBkb2NzIGFuZCBmb3IgYW55IHN0cmluZyB0aGF0XG4gICAgIyBjb250YWlucyB0aGUgc3Vic3RyaW5nIGBxYCwgYWRkIGl0IHRvIHRoZSBgbWF0Y2hlc2AgYXJyYXlcblxuICAgIGZvciBkIGluIGRvY3NcbiAgICAgIGlmIG1hdGNoZXMubGVuZ3RoID49IG51bV9pdGVtcyB0aGVuIGJyZWFrXG4gICAgICBpZiB0ZXN0X3N0cmluZyhkLmdvdl9uYW1lLCByZWdzKSB0aGVuIG1hdGNoZXMucHVzaCAkLmV4dGVuZCh7fSwgZClcbiAgICBcbiAgICBzZWxlY3RfdGV4dCBtYXRjaGVzLCB3b3JkcywgcmVnc1xuICAgIGNiIG1hdGNoZXNcbiAgICByZXR1cm5cbiBcblxuIyBpbnNlcnRzIDxzdHJvbmc+IGVsZW1lbnRzZSBpbiBhcnJheVxuc2VsZWN0X3RleHQgPSAoY2xvbmVzLHdvcmRzLHJlZ3MpIC0+XG4gIGZvciBkIGluIGNsb25lc1xuICAgIGQuZ292X25hbWU9c3Ryb25naWZ5KGQuZ292X25hbWUsIHdvcmRzLCByZWdzKVxuICBcbiAgcmV0dXJuIGNsb25lc1xuXG5cblxuIyBpbnNlcnRzIDxzdHJvbmc+IGVsZW1lbnRzZVxuc3Ryb25naWZ5ID0gKHMsIHdvcmRzLCByZWdzKSAtPlxuICByZWdzLmZvckVhY2ggKHIsaSkgLT5cbiAgICBzID0gcy5yZXBsYWNlIHIsIFwiPGI+I3t3b3Jkc1tpXX08L2I+XCJcbiAgcmV0dXJuIHNcblxuIyByZW1vdmVzIDw+IHRhZ3MgZnJvbSBhIHN0cmluZ1xuc3RyaXAgPSAocykgLT5cbiAgcy5yZXBsYWNlKC88W148Pl0qPi9nLCcnKVxuXG5cbiMgYWxsIHRpcm1zIHNwYWNlcyBmcm9tIGJvdGggc2lkZXMgYW5kIG1ha2UgY29udHJhY3RzIHNlcXVlbmNlcyBvZiBzcGFjZXMgdG8gMVxuZnVsbF90cmltID0gKHMpIC0+XG4gIHNzPXMudHJpbSgnJytzKVxuICBzcz1zcy5yZXBsYWNlKC8gKy9nLCcgJylcblxuIyByZXR1cm5zIGFuIGFycmF5IG9mIHdvcmRzIGluIGEgc3RyaW5nXG5nZXRfd29yZHMgPSAoc3RyKSAtPlxuICBmdWxsX3RyaW0oc3RyKS5zcGxpdCgnICcpXG5cblxuZ2V0X3dvcmRzX3JlZ3MgPSAoc3RyKSAtPlxuICB3b3JkcyA9IGdldF93b3JkcyBzdHJcbiAgcmVncyA9IHdvcmRzLm1hcCAodyktPiBuZXcgUmVnRXhwKFwiI3t3fVwiLCdpZycpXG4gIFt3b3JkcyxyZWdzXVxuXG5cbm1vZHVsZS5leHBvcnRzID0gUXVlcnlNYXRoZXJcblxuIiwiXG4jIyNcbiMgZmlsZTogdGVtcGxhdGVzMi5jb2ZmZWUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuI1xuIyBDbGFzcyB0byBtYW5hZ2UgdGVtcGxhdGVzIGFuZCByZW5kZXIgZGF0YSBvbiBodG1sIHBhZ2UuXG4jXG4jIFRoZSBtYWluIG1ldGhvZCA6IHJlbmRlcihkYXRhKSwgZ2V0X2h0bWwoZGF0YSlcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIyNcblxuXG5cbiMgTE9BRCBGSUVMRCBOQU1FUyBcbmZpZWxkTmFtZXMgPSB7fVxuXG5sb2FkX2ZpZWxkX25hbWVzID0gKHVybCkgLT5cbiAgJC5hamF4XG4gICAgdXJsOiB1cmxcbiAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgY2FjaGU6IHRydWVcbiAgICBzdWNjZXNzOiAoZmllbGRuYW1lc19qc29uKSA9PlxuICAgICAgZmllbGROYW1lcyA9IGZpZWxkbmFtZXNfanNvblxuICAgICAgcmV0dXJuXG4gICAgZXJyb3I6KGUpLT5cbiAgICAgIGNvbnNvbGUubG9nIGVcblxuXG5sb2FkX2ZpZWxkX25hbWVzKFwiY29uZmlnL2ZpZWxkbmFtZXMuanNvblwiKVxuXG5cblxucmVuZGVyX2ZpZWxkX3ZhbHVlID0obixkYXRhKSAtPlxuICB2PWRhdGFbbl1cbiAgaWYgbiA9PSBcIndlYl9zaXRlXCJcbiAgICByZXR1cm4gXCI8YSB0YXJnZXQ9J19ibGFuaycgaHJlZj0nI3t2fSc+I3t2fTwvYT5cIlxuICBlbHNlXG4gICAgcmV0dXJuIHZcbiAgXG4gIFxuXG5yZW5kZXJfZmllbGRfbmFtZSA9IChmTmFtZSkgLT5cbiAgaWYgZmllbGROYW1lc1tmTmFtZV0/XG4gICAgcmV0dXJuIGZpZWxkTmFtZXNbZk5hbWVdXG5cbiAgcyA9IGZOYW1lLnJlcGxhY2UoL18vZyxcIiBcIilcbiAgcyA9IHMuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzLnN1YnN0cmluZygxKVxuICByZXR1cm4gc1xuXG5cbnJlbmRlcl9maWVsZCA9IChmTmFtZSxkYXRhKS0+XG4gIHJldHVybiAnJyAgdW5sZXNzIGZWYWx1ZSA9IGRhdGFbZk5hbWVdXG4gIFwiXCJcIlxuICA8ZGl2PlxuICAgICAgPHNwYW4gY2xhc3M9J2YtbmFtJz4je3JlbmRlcl9maWVsZF9uYW1lIGZOYW1lfTwvc3Bhbj5cbiAgICAgIDxzcGFuIGNsYXNzPSdmLXZhbCc+I3tyZW5kZXJfZmllbGRfdmFsdWUoZk5hbWUsZGF0YSl9PC9zcGFuPlxuICA8L2Rpdj5cbiAgXCJcIlwiXG5cblxuXG4gIFxucmVuZGVyX2ZpZWxkcyA9KCBmaWVsZHMsIGRhdGEpIC0+XG4gICggcmVuZGVyX2ZpZWxkKGYsIGRhdGEpIGZvciBmIGluIGZpZWxkcykuam9pbignJylcblxuXG5cblxuICBcbnVuZGVyID0gKHMpIC0+IHMucmVwbGFjZSgvIC9nLCAnXycpXG5cblxucmVuZGVyX3RhYnMgPSAoaW5pdGlhbF9sYXlvdXQsIGRhdGEpIC0+XG4gIGxheW91dCA9IGFkZF9vdGhlcl90YWJfdG9fbGF5b3V0IGluaXRpYWxfbGF5b3V0LCBkYXRhXG4gICNyZW5kZXIgaGVhZGVyXG4gIGggPSAnPGRpdiByb2xlPVwidGFicGFuZWxcIiA+J1xuXG4gICNyZW5kZXIgdGFic1xuICBoICs9Jzx1bCBpZD1cImZpZWxkVGFic1wiIGNsYXNzPVwibmF2IG5hdi10YWJzXCIgcm9sZT1cInRhYmxpc3RcIj4nXG4gIFxuICBmb3IgdGFiLGkgaW4gbGF5b3V0XG4gICAgYWN0aXZlID0gaWYgaT4wIHRoZW4gJycgZWxzZSAnYWN0aXZlJ1xuICAgIGggKz1cIlwiXCJcbiAgICAgIDxsaSByb2xlPVwicHJlc2VudGF0aW9uXCIgY2xhc3M9XCIje2FjdGl2ZX1cIiBvbmNsaWNrPVwicmVtZW1iZXJfdGFiKCcje3VuZGVyKHRhYi5uYW1lKX0nKVwiPlxuICAgICAgICA8YSBocmVmPVwiIyN7dW5kZXIodGFiLm5hbWUpfVwiIGFyaWEtY29udHJvbHM9XCJob21lXCIgcm9sZT1cInRhYlwiIGRhdGEtdG9nZ2xlPVwidGFiXCI+XG4gICAgICAgICN7dGFiLm5hbWV9XG4gICAgICAgIDwvYT5cbiAgICAgIDwvbGk+XG4gICAgXCJcIlwiXG5cbiAgaCArPSAnPC91bD4nXG4gIGggKz0gJzxkaXYgY2xhc3M9XCJ0YWItY29udGVudFwiPidcblxuICAjcmVuZGVyIHRhYnMgY29udGVudFxuICBmb3IgdGFiLGkgaW4gbGF5b3V0XG4gICAgYWN0aXZlID0gaWYgaT4wIHRoZW4gJycgZWxzZSAnYWN0aXZlJ1xuICAgIGggKz1cIlwiXCJcbiAgICA8ZGl2IHJvbGU9XCJ0YWJwYW5lbFwiIGNsYXNzPVwidGFiLXBhbmUgI3thY3RpdmV9XCIgaWQ9XCIje3VuZGVyKHRhYi5uYW1lKX1cIiBzdHlsZT1cInBhZGRpbmctdG9wOiA0MHB4O1wiPlxuICAgICAgICAje3JlbmRlcl9maWVsZHMgdGFiLmZpZWxkcywgZGF0YX1cbiAgICA8L2Rpdj5cbiAgICBcIlwiXCJcbiAgXG4gICNyZW5kZXIgZm9vdGVyXG4gIGggKz0nPC9kaXY+J1xuICBoICs9JzwvZGl2PidcbiAgcmV0dXJuIGhcblxuXG5nZXRfbGF5b3V0X2ZpZWxkcyA9IChsYSkgLT5cbiAgZiA9IHt9XG4gIGZvciB0IGluIGxhXG4gICAgZm9yIGZpZWxkIGluIHQuZmllbGRzXG4gICAgICBmW2ZpZWxkXSA9IDFcbiAgcmV0dXJuIGZcblxuZ2V0X3JlY29yZF9maWVsZHMgPSAocikgLT5cbiAgZiA9IHt9XG4gIGZvciBmaWVsZF9uYW1lIG9mIHJcbiAgICBmW2ZpZWxkX25hbWVdID0gMVxuICByZXR1cm4gZlxuXG5nZXRfdW5tZW50aW9uZWRfZmllbGRzID0gKGxhLCByKSAtPlxuICBsYXlvdXRfZmllbGRzID0gZ2V0X2xheW91dF9maWVsZHMgbGFcbiAgcmVjb3JkX2ZpZWxkcyA9IGdldF9yZWNvcmRfZmllbGRzIHJcbiAgdW5tZW50aW9uZWRfZmllbGRzID0gW11cbiAgXG4gICNmb3IgZiBvZiByZWNvcmRfZmllbGRzXG4gICMgIGlmIG5vdCBsYXlvdXRfZmllbGRzW2ZdXG4gICMgICAgdW5tZW50aW9uZWRfZmllbGRzLnB1c2ggZlxuICBcbiAgdW5tZW50aW9uZWRfZmllbGRzLnB1c2goZikgZm9yIGYgb2YgcmVjb3JkX2ZpZWxkcyB3aGVuIG5vdCBsYXlvdXRfZmllbGRzW2ZdXG5cbiAgcmV0dXJuIHVubWVudGlvbmVkX2ZpZWxkc1xuXG5cbmFkZF9vdGhlcl90YWJfdG9fbGF5b3V0ID0gKGxheW91dD1bXSwgZGF0YSkgLT5cbiAgI2Nsb25lIHRoZSBsYXlvdXRcbiAgbCA9ICQuZXh0ZW5kIHRydWUsIFtdLCBsYXlvdXRcbiAgdCA9XG4gICAgbmFtZTogXCJPdGhlclwiXG4gICAgZmllbGRzOiBnZXRfdW5tZW50aW9uZWRfZmllbGRzIGwsIGRhdGFcblxuICBsLnB1c2ggdFxuICByZXR1cm4gbFxuXG5cblxuXG5jbGFzcyBUZW1wbGF0ZXMyXG5cbiAgQGxpc3QgPSB1bmRlZmluZWRcblxuICBjb25zdHJ1Y3RvcjooKSAtPlxuICAgIEBsaXN0ID0gW11cblxuICBhZGRfdGVtcGxhdGU6IChsYXlvdXRfbmFtZSwgbGF5b3V0X2pzb24pIC0+XG4gICAgQGxpc3QucHVzaFxuICAgICAgbmFtZTpsYXlvdXRfbmFtZVxuICAgICAgcmVuZGVyOihkYXQpIC0+XG4gICAgICAgIHJlbmRlcl90YWJzKGxheW91dF9qc29uLCBkYXQpXG5cblxuICBsb2FkX3RlbXBsYXRlOih0ZW1wbGF0ZV9uYW1lLCB1cmwpIC0+XG4gICAgJC5hamF4XG4gICAgICB1cmw6IHVybFxuICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgY2FjaGU6IHRydWVcbiAgICAgIHN1Y2Nlc3M6ICh0ZW1wbGF0ZV9qc29uKSA9PlxuICAgICAgICBAYWRkX3RlbXBsYXRlKHRlbXBsYXRlX25hbWUsIHRlbXBsYXRlX2pzb24pXG4gICAgICAgIHJldHVyblxuXG5cbiAgZ2V0X25hbWVzOiAtPlxuICAgICh0Lm5hbWUgZm9yIHQgaW4gQGxpc3QpXG5cbiAgZ2V0X2luZGV4X2J5X25hbWU6IChuYW1lKSAtPlxuICAgIGZvciB0LGkgaW4gQGxpc3RcbiAgICAgIGlmIHQubmFtZSBpcyBuYW1lXG4gICAgICAgIHJldHVybiBpXG4gICAgIHJldHVybiAtMVxuXG4gIGdldF9odG1sOiAoaW5kLCBkYXRhKSAtPlxuICAgIGlmIChpbmQgaXMgLTEpIHRoZW4gcmV0dXJuICBcIlwiXG4gICAgXG4gICAgaWYgQGxpc3RbaW5kXVxuICAgICAgcmV0dXJuIEBsaXN0W2luZF0ucmVuZGVyKGRhdGEpXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIFwiXCJcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gVGVtcGxhdGVzMlxuIl19
