(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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



},{}],2:[function(require,module,exports){
var GovSelector, query_matcher,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

query_matcher = require('./querymatcher.coffee');

GovSelector = (function() {
  var entered_value, govs_array;

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

  GovSelector.prototype.suggestionTemplate = Handlebars.compile("<div class=\"sugg-box\">\n  <div class=\"sugg-state\">{{{state}}}</div>\n  <div class=\"sugg-name\">{{{gov_name}}}</div>\n  <div class=\"sugg-type\">{{{gov_type}}}</div>\n</div>");

  entered_value = "";

  govs_array = [];

  GovSelector.prototype.count_govs = function() {
    var count, d, i, len, ref;
    count = 0;
    ref = this.govs_array;
    for (i = 0, len = ref.length; i < len; i++) {
      d = ref[i];
      if (GOVWIKI.state_filter && d.state !== GOVWIKI.state_filter) {
        continue;
      }
      if (GOVWIKI.gov_type_filter && d.gov_type !== GOVWIKI.gov_type_filter) {
        continue;
      }
      count++;
    }
    return count;
  };

  GovSelector.prototype.startSuggestion = function(govs) {
    this.govs_array = govs;
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
    $('.gov-counter').text(this.count_govs());
  };

  return GovSelector;

})();

module.exports = GovSelector;



},{"./querymatcher.coffee":5}],3:[function(require,module,exports){
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



},{}],4:[function(require,module,exports){

/*
file: main.coffe -- The entry -----------------------------------------------------------------------------------
  :
gov_finder = new GovFinder
gov_details = new GovDetails
gov_finder.on_select = gov_details.show
-----------------------------------------------------------------------------------------------------------------
 */
var GovSelector, Templates2, _jqgs, activate_tab, active_tab, adjust_typeahead_width, build_select_element, build_selector, get_record, gov_selector, govmap, livereload, templates;

GovSelector = require('./govselector.coffee');

_jqgs = require('./jquery.govselector.coffee');

Templates2 = require('./templates2.coffee');

govmap = require('./govmap.coffee');

window.GOVWIKI = {
  state_filter: '',
  gov_type_filter: ''
};

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
    },
    error: function(e) {
      return console.log(e);
    }
  });
};

$('#maparea').css('visibility', 'hidden');

templates.load_template("tabs", "config/tablayout.json");

build_selector = function(container, text, url, where_to_store_value) {
  return $.ajax({
    url: url,
    dataType: 'json',
    cache: true,
    success: (function(_this) {
      return function(data) {
        build_select_element(container, text, data.sort(), where_to_store_value);
      };
    })(this),
    error: function(e) {
      return console.log(e);
    }
  });
};

build_select_element = function(container, text, arr, where_to_store_value) {
  var i, len, s, select, v;
  s = "<select class='form-control' style='max-width:160px;'><option value=''>" + text + "</option>";
  for (i = 0, len = arr.length; i < len; i++) {
    v = arr[i];
    s += "<option value='" + v + "'>" + v + "</option>";
  }
  s += "</select>";
  select = $(s);
  $(container).append(select);
  return select.change(function(e) {
    var el;
    el = $(e.target);
    window.GOVWIKI[where_to_store_value] = el.val();
    return $('.gov-counter').text(gov_selector.count_govs());
  });
};

build_selector('.state-container', 'State..', 'data/state.json', 'state_filter');

build_selector('.gov-type-container', 'type of government..', 'data/gov_type.json', 'gov_type_filter');

adjust_typeahead_width = function() {
  return $(window).resize(function() {
    var inp, par;
    inp = $('#myinput');
    par = $('#typeahed-container');
    console.log((inp.width()) + " : " + (par.width()));
    return inp.width(par.width());
  });
};

adjust_typeahead_width();

livereload = function(port) {
  var url;
  url = window.location.origin.replace(/:[^:]*$/, "");
  return $.getScript(url + ":" + port, (function(_this) {
    return function() {
      return $('body').append("<div style='position:absolute;z-index:1000;\nwidth:100%; top:0;color:red; text-align: center; \npadding:1px;font-size:10px;line-height:1'>live</div>");
    };
  })(this));
};

livereload("9090");



},{"./govmap.coffee":1,"./govselector.coffee":2,"./jquery.govselector.coffee":3,"./templates2.coffee":6}],5:[function(require,module,exports){
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
      if (GOVWIKI.state_filter && d.state !== GOVWIKI.state_filter) {
        continue;
      }
      if (GOVWIKI.gov_type_filter && d.gov_type !== GOVWIKI.gov_type_filter) {
        continue;
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



},{}],6:[function(require,module,exports){

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



},{}]},{},[4])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL3ZhZGltaXZsZXYvUHJvamVjdHMvX3Byb2plY3RzL2dvdndpa2kudXMvY29mZmVlL2dvdm1hcC5jb2ZmZWUiLCIvVXNlcnMvdmFkaW1pdmxldi9Qcm9qZWN0cy9fcHJvamVjdHMvZ292d2lraS51cy9jb2ZmZWUvZ292c2VsZWN0b3IuY29mZmVlIiwiL1VzZXJzL3ZhZGltaXZsZXYvUHJvamVjdHMvX3Byb2plY3RzL2dvdndpa2kudXMvY29mZmVlL2pxdWVyeS5nb3ZzZWxlY3Rvci5jb2ZmZWUiLCIvVXNlcnMvdmFkaW1pdmxldi9Qcm9qZWN0cy9fcHJvamVjdHMvZ292d2lraS51cy9jb2ZmZWUvbWFpbi5jb2ZmZWUiLCIvVXNlcnMvdmFkaW1pdmxldi9Qcm9qZWN0cy9fcHJvamVjdHMvZ292d2lraS51cy9jb2ZmZWUvcXVlcnltYXRjaGVyLmNvZmZlZSIsIi9Vc2Vycy92YWRpbWl2bGV2L1Byb2plY3RzL19wcm9qZWN0cy9nb3Z3aWtpLnVzL2NvZmZlZS90ZW1wbGF0ZXMyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsMkNBQUE7O0FBQUEsUUFBQSxHQUFlLElBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFiLENBQ2IsK0VBRGEsRUFFVCxJQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBYixDQUFtQixFQUFuQixFQUF1QixFQUF2QixDQUZTLEVBR1QsSUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQWIsQ0FBb0IsQ0FBcEIsRUFBdUIsQ0FBdkIsQ0FIUyxFQUlULElBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFiLENBQW9CLEVBQXBCLEVBQXdCLEVBQXhCLENBSlMsQ0FBZixDQUFBOztBQUFBLEdBUUEsR0FBVSxJQUFBLEtBQUEsQ0FDUjtBQUFB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LEVBQU0sSUFBTixHQUFBO0FBQ1IsSUFBQSxJQUFJLEdBQUEsS0FBTyxDQUFBLENBQVg7QUFBb0IsYUFBUSxFQUFSLENBQXBCO0tBQUE7QUFFQSxJQUFBLElBQUcsSUFBQyxDQUFBLElBQUssQ0FBQSxHQUFBLENBQVQ7QUFDRSxhQUFPLElBQUMsQ0FBQSxJQUFLLENBQUEsR0FBQSxDQUFJLENBQUMsTUFBWCxDQUFrQixJQUFsQixDQUFQLENBREY7S0FBQSxNQUFBO0FBR0UsYUFBTyxFQUFQLENBSEY7S0FIUTtFQUFBLENBL0JWLENBQUE7O29CQUFBOztJQXBKRixDQUFBOztBQUFBLE1BNkxNLENBQUMsT0FBUCxHQUFpQixVQTdMakIsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJwaW5JbWFnZSA9IG5ldyAoZ29vZ2xlLm1hcHMuTWFya2VySW1hZ2UpKFxuICAnaHR0cDovL2NoYXJ0LmFwaXMuZ29vZ2xlLmNvbS9jaGFydD9jaHN0PWRfbWFwX3Bpbl9sZXR0ZXImY2hsZD1afDc3NzdCQnxGRkZGRkYnICxcbiAgbmV3IChnb29nbGUubWFwcy5TaXplKSgyMSwgMzQpLFxuICBuZXcgKGdvb2dsZS5tYXBzLlBvaW50KSgwLCAwKSxcbiAgbmV3IChnb29nbGUubWFwcy5Qb2ludCkoMTAsIDM0KVxuICApXG5cblxubWFwID0gbmV3IEdNYXBzXG4gIGVsOiAnI2dvdm1hcCdcbiAgbGF0OiAtMTIuMDQzMzMzXG4gIGxuZzogLTc3LjAyODMzM1xuICB6b29tOjE0XG5cbmdlb2NvZGVfYWRkciA9IChhZGRyLGRhdGEpIC0+XG4gIEdNYXBzLmdlb2NvZGVcbiAgICBhZGRyZXNzOiBhZGRyXG4gICAgY2FsbGJhY2s6IChyZXN1bHRzLCBzdGF0dXMpIC0+XG4gICAgICBpZiBzdGF0dXMgPT0gJ09LJ1xuICAgICAgICBsYXRsbmcgPSByZXN1bHRzWzBdLmdlb21ldHJ5LmxvY2F0aW9uXG4gICAgICAgIG1hcC5zZXRDZW50ZXIgbGF0bG5nLmxhdCgpLCBsYXRsbmcubG5nKClcbiAgICAgICAgbWFwLmFkZE1hcmtlclxuICAgICAgICAgIGxhdDogbGF0bG5nLmxhdCgpXG4gICAgICAgICAgbG5nOiBsYXRsbmcubG5nKClcbiAgICAgICAgICBzaXplOiAnc21hbGwnXG4gICAgICAgICAgdGl0bGU6IHJlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3NcbiAgICAgICAgICBpbmZvV2luZG93OlxuICAgICAgICAgICAgY29udGVudDogcmVzdWx0c1swXS5mb3JtYXR0ZWRfYWRkcmVzc1xuICAgICAgICBcbiAgICAgICAgaWYgZGF0YVxuICAgICAgICAgIG1hcC5hZGRNYXJrZXJcbiAgICAgICAgICAgIGxhdDogZGF0YS5sYXRpdHVkZVxuICAgICAgICAgICAgbG5nOiBkYXRhLmxvbmdpdHVkZVxuICAgICAgICAgICAgc2l6ZTogJ3NtYWxsJ1xuICAgICAgICAgICAgY29sb3I6ICdibHVlJ1xuICAgICAgICAgICAgaWNvbjogcGluSW1hZ2VcbiAgICAgICAgICAgIHRpdGxlOiAgXCIje2RhdGEubGF0aXR1ZGV9ICN7ZGF0YS5sb25naXR1ZGV9XCJcbiAgICAgICAgICAgIGluZm9XaW5kb3c6XG4gICAgICAgICAgICAgIGNvbnRlbnQ6IFwiI3tkYXRhLmxhdGl0dWRlfSAje2RhdGEubG9uZ2l0dWRlfVwiXG4gICAgICAgICAgICBcbiAgICAgICAgJCgnLmdvdm1hcC1mb3VuZCcpLmh0bWwgXCI8c3Ryb25nPkZPVU5EOiA8L3N0cm9uZz4je3Jlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3N9XCJcbiAgICAgIHJldHVyblxuXG5jbGVhcj0ocyktPlxuICByZXR1cm4gaWYgcy5tYXRjaCgvIGJveCAvaSkgdGhlbiAnJyBlbHNlIHNcblxuXG5cbmdlb2NvZGUgPSAoZGF0YSkgLT5cbiAgYWRkciA9IFwiI3tjbGVhcihkYXRhLmFkZHJlc3MxKX0gI3tjbGVhcihkYXRhLmFkZHJlc3MyKX0sICN7ZGF0YS5jaXR5fSwgI3tkYXRhLnN0YXRlfSAje2RhdGEuemlwfSwgVVNBXCJcbiAgJCgnI2dvdmFkZHJlc3MnKS52YWwoYWRkcilcbiAgZ2VvY29kZV9hZGRyIGFkZHIsIGRhdGFcblxuXCIxIERvY3RvciBDYXJsdG9uIEIgR29vZGxldHQgUGxhY2UsIFNhbiBGcmFuY2lzY28sIENBIDk0MTAyLCBVU0FcIlxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGdlb2NvZGU6IGdlb2NvZGVcbiAgZ29jb2RlX2FkZHI6IGdlb2NvZGVfYWRkclxuXG4iLCJcbnF1ZXJ5X21hdGNoZXIgPSByZXF1aXJlKCcuL3F1ZXJ5bWF0Y2hlci5jb2ZmZWUnKVxuXG5jbGFzcyBHb3ZTZWxlY3RvclxuICBcbiAgIyBzdHViIG9mIGEgY2FsbGJhY2sgdG8gZW52b2tlIHdoZW4gdGhlIHVzZXIgc2VsZWN0cyBzb21ldGhpbmdcbiAgb25fc2VsZWN0ZWQ6IChldnQsIGRhdGEsIG5hbWUpIC0+XG5cblxuICBjb25zdHJ1Y3RvcjogKEBodG1sX3NlbGVjdG9yLCBkb2NzX3VybCwgQG51bV9pdGVtcykgLT5cbiAgICAkLmFqYXhcbiAgICAgIHVybDogZG9jc191cmxcbiAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgIGNhY2hlOiB0cnVlXG4gICAgICBzdWNjZXNzOiBAc3RhcnRTdWdnZXN0aW9uXG4gICAgICBcblxuXG5cbiAgc3VnZ2VzdGlvblRlbXBsYXRlIDogSGFuZGxlYmFycy5jb21waWxlKFwiXCJcIlxuICAgIDxkaXYgY2xhc3M9XCJzdWdnLWJveFwiPlxuICAgICAgPGRpdiBjbGFzcz1cInN1Z2ctc3RhdGVcIj57e3tzdGF0ZX19fTwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cInN1Z2ctbmFtZVwiPnt7e2dvdl9uYW1lfX19PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwic3VnZy10eXBlXCI+e3t7Z292X3R5cGV9fX08L2Rpdj5cbiAgICA8L2Rpdj5cIlwiXCIpXG5cblxuXG4gIGVudGVyZWRfdmFsdWUgPSBcIlwiXG5cbiAgZ292c19hcnJheSA9IFtdXG5cbiAgY291bnRfZ292cyA6ICgpIC0+XG4gICAgY291bnQgPTBcbiAgICBmb3IgZCBpbiBAZ292c19hcnJheVxuICAgICAgaWYgR09WV0lLSS5zdGF0ZV9maWx0ZXIgYW5kIGQuc3RhdGUgaXNudCBHT1ZXSUtJLnN0YXRlX2ZpbHRlciB0aGVuIGNvbnRpbnVlXG4gICAgICBpZiBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlciBhbmQgZC5nb3ZfdHlwZSBpc250IEdPVldJS0kuZ292X3R5cGVfZmlsdGVyIHRoZW4gY29udGludWVcbiAgICAgIGNvdW50KytcbiAgICByZXR1cm4gY291bnRcblxuXG4gIHN0YXJ0U3VnZ2VzdGlvbiA6IChnb3ZzKSA9PlxuICAgIEBnb3ZzX2FycmF5ID0gZ292c1xuICAgICQoJy50eXBlYWhlYWQnKS5rZXl1cCAoZXZlbnQpID0+XG4gICAgICBAZW50ZXJlZF92YWx1ZSA9ICQoZXZlbnQudGFyZ2V0KS52YWwoKVxuICAgIFxuICAgICQoQGh0bWxfc2VsZWN0b3IpLmF0dHIgJ3BsYWNlaG9sZGVyJywgJ0dPVkVSTk1FTlQgTkFNRSdcbiAgICAkKEBodG1sX3NlbGVjdG9yKS50eXBlYWhlYWQoXG4gICAgICAgIGhpbnQ6IGZhbHNlXG4gICAgICAgIGhpZ2hsaWdodDogZmFsc2VcbiAgICAgICAgbWluTGVuZ3RoOiAxXG4gICAgICAsXG4gICAgICAgIG5hbWU6ICdnb3ZfbmFtZSdcbiAgICAgICAgZGlzcGxheUtleTogJ2dvdl9uYW1lJ1xuICAgICAgICBzb3VyY2U6IHF1ZXJ5X21hdGNoZXIoZ292cywgQG51bV9pdGVtcylcbiAgICAgICAgI3NvdXJjZTogYmxvb2Rob3VuZC50dEFkYXB0ZXIoKVxuICAgICAgICB0ZW1wbGF0ZXM6IHN1Z2dlc3Rpb246IEBzdWdnZXN0aW9uVGVtcGxhdGVcbiAgICApXG4gICAgLm9uICd0eXBlYWhlYWQ6c2VsZWN0ZWQnLCAgKGV2dCwgZGF0YSwgbmFtZSkgPT5cbiAgICAgICAgJCgnLnR5cGVhaGVhZCcpLnR5cGVhaGVhZCAndmFsJywgQGVudGVyZWRfdmFsdWVcbiAgICAgICAgQG9uX3NlbGVjdGVkKGV2dCwgZGF0YSwgbmFtZSlcbiAgIFxuICAgIC5vbiAndHlwZWFoZWFkOmN1cnNvcmNoYW5nZWQnLCAoZXZ0LCBkYXRhLCBuYW1lKSA9PlxuICAgICAgICAkKCcudHlwZWFoZWFkJykudmFsIEBlbnRlcmVkX3ZhbHVlXG4gICAgXG5cbiAgICAkKCcuZ292LWNvdW50ZXInKS50ZXh0IEBjb3VudF9nb3ZzKClcbiAgICByZXR1cm5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cz1Hb3ZTZWxlY3RvclxuXG5cblxuIiwiKCgkKSAtPlxuXG4gICQuZ292c2VsZWN0b3IgPSAoZWwsIG9wdGlvbnMpIC0+XG5cbiAgICAjIFRvIGF2b2lkIHNjb3BlIGlzc3VlcywgdXNlICdiYXNlJyBpbnN0ZWFkIG9mICd0aGlzJ1xuICAgICMgdG8gcmVmZXJlbmNlIHRoaXMgY2xhc3MgZnJvbSBpbnRlcm5hbCBldmVudHMgYW5kIGZ1bmN0aW9ucy5cbiAgICBiYXNlID0gdGhpc1xuICAgIFxuICAgIFxuICAgICMgQWNjZXNzIHRvIGpRdWVyeSBhbmQgRE9NIHZlcnNpb25zIG9mIGVsZW1lbnRcbiAgICBiYXNlLiRlbCA9ICQoZWwpXG4gICAgYmFzZS5lbCA9IGVsXG4gICAgXG4gICAgXG4gICAgIyBBZGQgYSByZXZlcnNlIHJlZmVyZW5jZSB0byB0aGUgRE9NIG9iamVjdFxuICAgIGJhc2UuJGVsLmRhdGEgJ2dvdnNlbGVjdG9yJywgYmFzZVxuXG4gICAgIyBkZWxheSB1c2FnZVxuICAgICMkKCdpbnB1dCcpLmtleXVwIC0+XG4gICAgIyAgZGVsYXkgKC0+IGFsZXJ0ICdUaW1lIGVsYXBzZWQhJzsgcmV0dXJuKSwgMTAwMFxuICAgICMgIHJldHVyblxuICAgICAgXG4gICAgZGVsYXkgPSBkbyAtPlxuICAgICAgdGltZXIgPSAwXG4gICAgICAoY2FsbGJhY2ssIG1zKSAtPlxuICAgICAgICBjbGVhclRpbWVvdXQgdGltZXJcbiAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGNhbGxiYWNrLCBtcylcbiAgICAgICAgcmV0dXJuXG4gICAgXG4gICAgb25rZXl1cCA9IChldmVudCkgLT5cbiAgICAgIHN3aXRjaCAgZXZlbnQud2hpY2hcbiAgICAgICAgIyBFbnRlclxuICAgICAgICB3aGVuIDEzXG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICQoJy50eXBlYWhlYWQnKS50eXBlYWhlYWQgJ3ZhbCcsIGJhc2UuJGVsLnZhbCgpXG4gICAgICAgICAgJCgnLnR5cGVhaGVhZCcpLnR5cGVhaGVhZCAnb3BlbidcbiAgICAgICAgIyBFc2NcbiAgICAgICAgd2hlbiAyN1xuICAgICAgICAgICQoJy50eXBlYWhlYWQnKS50eXBlYWhlYWQgJ2Nsb3NlJ1xuICAgICAgICAjIFVwXG4gICAgICAgIHdoZW4gMzggdGhlblxuICAgICAgICAjIERvd25cbiAgICAgICAgd2hlbiA0MCB0aGVuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAkKCcudHlwZWFoZWFkJykudHlwZWFoZWFkICd2YWwnLCBiYXNlLiRlbC52YWwoKVxuICAgICAgICAgICQoJy50eXBlYWhlYWQnKS50eXBlYWhlYWQgJ29wZW4nXG4gICAgICAjZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgY29uc29sZS5sb2cgZXZlbnQud2hpY2hcbiAgICAgIHJldHVyblxuXG4gICAgYmx1ciA9IChldmVudCkgLT5cbiAgICAgIGNvbnNvbGUubG9nICdibHVyJ1xuICAgIFxuICAgIGJhc2UuaW5pdCA9IC0+XG4gICAgICBiYXNlLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgJC5nb3ZzZWxlY3Rvci5kZWZhdWx0T3B0aW9ucywgb3B0aW9ucylcbiAgICAgICMgUHV0IHlvdXIgaW5pdGlhbGl6YXRpb24gY29kZSBoZXJlXG4gICAgICBiYXNlLiRlbC5jc3MgJ2JhY2tncm91bmQtY29sb3InLCAnd2hpdGUnXG4gICAgICBiYXNlLiRlbC5rZXl1cCBvbmtleXVwXG4gICAgICBiYXNlLiRlbC5ibHVyIG9uYmx1clxuXG4gICAgICByZXR1cm5cblxuICAgIFxuICAgICMgU2FtcGxlIEZ1bmN0aW9uLCBVbmNvbW1lbnQgdG8gdXNlXG4gICAgIyBiYXNlLmZ1bmN0aW9uTmFtZSA9IGZ1bmN0aW9uKHBhcmFtYXRlcnMpe1xuICAgICNcbiAgICAjIH07XG4gICAgXG4gICAgXG4gICAgIyBSdW4gaW5pdGlhbGl6ZXJcbiAgICBiYXNlLmluaXQoKVxuICAgIHJldHVyblxuXG4gICAgXG4gICQuZ292c2VsZWN0b3IuZGVmYXVsdE9wdGlvbnMgPVxuICAgIHJvd3M6IDVcbiAgICB0ZW1wbGF0ZTogJ3t7fX0nXG5cbiAgICBcbiAgJC5mbi5nb3ZzZWxlY3RvciA9IChvcHRpb25zKSAtPlxuICAgIEBlYWNoIC0+XG4gICAgICBuZXcgKCQuZ292c2VsZWN0b3IpKHRoaXMsIG9wdGlvbnMpXG4gICAgICByZXR1cm5cblxuICAgIFxuICAjIFRoaXMgZnVuY3Rpb24gYnJlYWtzIHRoZSBjaGFpbiwgYnV0IHJldHVybnNcbiAgIyB0aGUgZ292c2VsZWN0b3IgaWYgaXQgaGFzIGJlZW4gYXR0YWNoZWQgdG8gdGhlIG9iamVjdC5cbiAgJC5mbi5nZXRnb3ZzZWxlY3RvciA9IC0+XG4gICAgQGRhdGEgJ2dvdnNlbGVjdG9yJ1xuICAgIHJldHVyblxuXG4gICAgXG4gIHJldHVyblxuKSBqUXVlcnlcbiIsIiMjI1xuZmlsZTogbWFpbi5jb2ZmZSAtLSBUaGUgZW50cnkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgOlxuZ292X2ZpbmRlciA9IG5ldyBHb3ZGaW5kZXJcbmdvdl9kZXRhaWxzID0gbmV3IEdvdkRldGFpbHNcbmdvdl9maW5kZXIub25fc2VsZWN0ID0gZ292X2RldGFpbHMuc2hvd1xuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMjI1xuXG5Hb3ZTZWxlY3RvciA9IHJlcXVpcmUgJy4vZ292c2VsZWN0b3IuY29mZmVlJ1xuX2pxZ3MgICAgICAgPSByZXF1aXJlICcuL2pxdWVyeS5nb3ZzZWxlY3Rvci5jb2ZmZWUnXG5UZW1wbGF0ZXMyICAgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlczIuY29mZmVlJ1xuZ292bWFwICAgICAgPSByZXF1aXJlICcuL2dvdm1hcC5jb2ZmZWUnXG5cbndpbmRvdy5HT1ZXSUtJID1cbiAgc3RhdGVfZmlsdGVyIDogJydcbiAgZ292X3R5cGVfZmlsdGVyIDogJydcblxuXG5cblxuXG5cbmdvdl9zZWxlY3RvciA9IG5ldyBHb3ZTZWxlY3RvciAnLnR5cGVhaGVhZCcsICdkYXRhL2hfdHlwZXMuanNvbicsIDdcbnRlbXBsYXRlcyA9IG5ldyBUZW1wbGF0ZXMyXG5hY3RpdmVfdGFiPVwiXCJcblxud2luZG93LnJlbWVtYmVyX3RhYiA9KG5hbWUpLT4gYWN0aXZlX3RhYiA9IG5hbWVcblxud2luZG93Lmdlb2NvZGVfYWRkciA9IChpbnB1dF9zZWxlY3RvciktPiBnb3ZtYXAuZ29jb2RlX2FkZHIgJChpbnB1dF9zZWxlY3RvcikudmFsKClcblxuYWN0aXZhdGVfdGFiID0oKSAtPlxuICAkKFwiI2ZpZWxkVGFicyBhW2hyZWY9JyMje2FjdGl2ZV90YWJ9J11cIikudGFiKCdzaG93JylcblxuXG5nb3Zfc2VsZWN0b3Iub25fc2VsZWN0ZWQgPSAoZXZ0LCBkYXRhLCBuYW1lKSAtPlxuICAjcmVuZGVyRGF0YSAnI2RldGFpbHMnLCBkYXRhXG4gICQoJyNkZXRhaWxzJykuaHRtbCB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgZGF0YSlcbiAgYWN0aXZhdGVfdGFiKClcbiAgZ2V0X3JlY29yZCBcImluY19pZDoje2RhdGFbXCJpbmNfaWRcIl19XCJcbiAgcmV0dXJuXG5cblxuZ2V0X3JlY29yZCA9IChxdWVyeSkgLT5cbiAgJC5hamF4XG4gICAgdXJsOiBcImh0dHBzOi8vYXBpLm1vbmdvbGFiLmNvbS9hcGkvMS9kYXRhYmFzZXMvZ292d2lraS9jb2xsZWN0aW9ucy9nb3ZzLz9xPXsje3F1ZXJ5fX0mZj17X2lkOjB9Jmw9MSZhcGlLZXk9MFk1WF9RazJ1T0pSZEhKV0pLU1JXazZsNkpxVlRTMnlcIlxuICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICBjYWNoZTogdHJ1ZVxuICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgaWYgZGF0YS5sZW5ndGhcbiAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sIHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBkYXRhWzBdKVxuICAgICAgICBhY3RpdmF0ZV90YWIoKVxuICAgICAgICAkKCcjbWFwYXJlYScpLmNzcygndmlzaWJpbGl0eScsJ3Zpc2libGUnKVxuICAgICAgICBnb3ZtYXAuZ2VvY29kZSBkYXRhWzBdXG4gICAgICByZXR1cm5cbiAgICBlcnJvcjooZSkgLT5cbiAgICAgIGNvbnNvbGUubG9nIGVcblxuXG5cblxuXG4kKCcjbWFwYXJlYScpLmNzcygndmlzaWJpbGl0eScsJ2hpZGRlbicpXG5cblxudGVtcGxhdGVzLmxvYWRfdGVtcGxhdGUgXCJ0YWJzXCIsIFwiY29uZmlnL3RhYmxheW91dC5qc29uXCJcblxuXG5idWlsZF9zZWxlY3RvciA9IChjb250YWluZXIsIHRleHQsIHVybCwgd2hlcmVfdG9fc3RvcmVfdmFsdWUgKSAtPlxuICAkLmFqYXhcbiAgICB1cmw6IHVybFxuICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICBjYWNoZTogdHJ1ZVxuICAgIHN1Y2Nlc3M6IChkYXRhKSA9PlxuICAgICAgI2E9JC5leHRlbmQgdHJ1ZSBbXSxkYXRhXG4gICAgICBidWlsZF9zZWxlY3RfZWxlbWVudCBjb250YWluZXIsIHRleHQsIGRhdGEuc29ydCgpLCB3aGVyZV90b19zdG9yZV92YWx1ZVxuICAgICAgcmV0dXJuXG4gICAgZXJyb3I6KGUpIC0+XG4gICAgICBjb25zb2xlLmxvZyBlXG5cblxuYnVpbGRfc2VsZWN0X2VsZW1lbnQgPSAoY29udGFpbmVyLCB0ZXh0LCBhcnIsIHdoZXJlX3RvX3N0b3JlX3ZhbHVlICkgLT5cbiAgcyAgPSBcIjxzZWxlY3QgY2xhc3M9J2Zvcm0tY29udHJvbCcgc3R5bGU9J21heC13aWR0aDoxNjBweDsnPjxvcHRpb24gdmFsdWU9Jyc+I3t0ZXh0fTwvb3B0aW9uPlwiXG4gIHMgKz0gXCI8b3B0aW9uIHZhbHVlPScje3Z9Jz4je3Z9PC9vcHRpb24+XCIgZm9yIHYgaW4gYXJyXG4gIHMgKz0gXCI8L3NlbGVjdD5cIlxuICBzZWxlY3QgPSAkKHMpXG4gICQoY29udGFpbmVyKS5hcHBlbmQoc2VsZWN0KVxuICBzZWxlY3QuY2hhbmdlIChlKSAtPlxuICAgIGVsID0gJChlLnRhcmdldClcbiAgICB3aW5kb3cuR09WV0lLSVt3aGVyZV90b19zdG9yZV92YWx1ZV0gPSBlbC52YWwoKVxuICAgICQoJy5nb3YtY291bnRlcicpLnRleHQgZ292X3NlbGVjdG9yLmNvdW50X2dvdnMoKVxuXG5cbmJ1aWxkX3NlbGVjdG9yKCcuc3RhdGUtY29udGFpbmVyJ1xuICAsICdTdGF0ZS4uJ1xuICAsICdkYXRhL3N0YXRlLmpzb24nXG4gICwgJ3N0YXRlX2ZpbHRlcicpXG5cbmJ1aWxkX3NlbGVjdG9yKCcuZ292LXR5cGUtY29udGFpbmVyJ1xuICAsICd0eXBlIG9mIGdvdmVybm1lbnQuLidcbiAgLCAnZGF0YS9nb3ZfdHlwZS5qc29uJ1xuICAsICdnb3ZfdHlwZV9maWx0ZXInKVxuXG5cbmFkanVzdF90eXBlYWhlYWRfd2lkdGggPSgpIC0+XG4gICQod2luZG93KS5yZXNpemUgLT5cbiAgICBpbnAgPSAkKCcjbXlpbnB1dCcpXG4gICAgcGFyID0gJCgnI3R5cGVhaGVkLWNvbnRhaW5lcicpXG4gICAgY29uc29sZS5sb2cgXCIje2lucC53aWR0aCgpfSA6ICN7cGFyLndpZHRoKCl9XCJcbiAgICBpbnAud2lkdGggcGFyLndpZHRoKClcblxuYWRqdXN0X3R5cGVhaGVhZF93aWR0aCgpXG5cbiAgXG5cbiMgYWRkIGxpdmUgcmVsb2FkIHRvIHRoZSBzaXRlLiBGb3IgZGV2ZWxvcG1lbnQgb25seS5cbmxpdmVyZWxvYWQgPSAocG9ydCkgLT5cbiAgdXJsPXdpbmRvdy5sb2NhdGlvbi5vcmlnaW4ucmVwbGFjZSAvOlteOl0qJC8sIFwiXCJcbiAgJC5nZXRTY3JpcHQgdXJsICsgXCI6XCIgKyBwb3J0LCA9PlxuICAgICQoJ2JvZHknKS5hcHBlbmQgXCJcIlwiXG4gICAgPGRpdiBzdHlsZT0ncG9zaXRpb246YWJzb2x1dGU7ei1pbmRleDoxMDAwO1xuICAgIHdpZHRoOjEwMCU7IHRvcDowO2NvbG9yOnJlZDsgdGV4dC1hbGlnbjogY2VudGVyOyBcbiAgICBwYWRkaW5nOjFweDtmb250LXNpemU6MTBweDtsaW5lLWhlaWdodDoxJz5saXZlPC9kaXY+XG4gICAgXCJcIlwiXG5cblxubGl2ZXJlbG9hZCBcIjkwOTBcIlxuXG5cblxuIiwiXG5cblxuIyBUYWtlcyBhbiBhcnJheSBvZiBkb2NzIHRvIHNlYXJjaCBpbi5cbiMgUmV0dXJucyBhIGZ1bmN0aW9ucyB0aGF0IHRha2VzIDIgcGFyYW1zIFxuIyBxIC0gcXVlcnkgc3RyaW5nIGFuZCBcbiMgY2IgLSBjYWxsYmFjayB0aGF0IHdpbGwgYmUgY2FsbGVkIHdoZW4gdGhlIHNlYXJjaCBpcyBkb25lLlxuIyBjYiByZXR1cm5zIGFuIGFycmF5IG9mIG1hdGNoaW5nIGRvY3VtZW50cy5cbiMgbXVtX2l0ZW1zIC0gbWF4IG51bWJlciBvZiBmb3VuZCBpdGVtcyB0byBzaG93XG5RdWVyeU1hdGhlciA9IChkb2NzLCBudW1faXRlbXM9NSkgLT5cbiAgKHEsIGNiKSAtPlxuICAgIHRlc3Rfc3RyaW5nID0ocywgcmVncykgLT5cbiAgICAgIChpZiBub3Qgci50ZXN0KHMpIHRoZW4gcmV0dXJuIGZhbHNlKSAgZm9yIHIgaW4gcmVnc1xuICAgICAgcmV0dXJuIHRydWVcblxuICAgIFt3b3JkcyxyZWdzXSA9IGdldF93b3Jkc19yZWdzIHFcbiAgICBtYXRjaGVzID0gW11cbiAgICAjIGl0ZXJhdGUgdGhyb3VnaCB0aGUgcG9vbCBvZiBkb2NzIGFuZCBmb3IgYW55IHN0cmluZyB0aGF0XG4gICAgIyBjb250YWlucyB0aGUgc3Vic3RyaW5nIGBxYCwgYWRkIGl0IHRvIHRoZSBgbWF0Y2hlc2AgYXJyYXlcblxuICAgIGZvciBkIGluIGRvY3NcbiAgICAgIGlmIG1hdGNoZXMubGVuZ3RoID49IG51bV9pdGVtcyB0aGVuIGJyZWFrXG4gICAgICBpZiBHT1ZXSUtJLnN0YXRlX2ZpbHRlciBhbmQgZC5zdGF0ZSBpc250IEdPVldJS0kuc3RhdGVfZmlsdGVyIHRoZW4gY29udGludWVcbiAgICAgIGlmIEdPVldJS0kuZ292X3R5cGVfZmlsdGVyIGFuZCBkLmdvdl90eXBlIGlzbnQgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXIgdGhlbiBjb250aW51ZVxuXG4gICAgICBpZiB0ZXN0X3N0cmluZyhkLmdvdl9uYW1lLCByZWdzKSB0aGVuIG1hdGNoZXMucHVzaCAkLmV4dGVuZCh7fSwgZClcbiAgICAgICNpZiB0ZXN0X3N0cmluZyhcIiN7ZC5nb3ZfbmFtZX0gI3tkLnN0YXRlfSAje2QuZ292X3R5cGV9ICN7ZC5pbmNfaWR9XCIsIHJlZ3MpIHRoZW4gbWF0Y2hlcy5wdXNoICQuZXh0ZW5kKHt9LCBkKVxuICAgIFxuICAgIHNlbGVjdF90ZXh0IG1hdGNoZXMsIHdvcmRzLCByZWdzXG4gICAgY2IgbWF0Y2hlc1xuICAgIHJldHVyblxuIFxuXG4jIGluc2VydHMgPHN0cm9uZz4gZWxlbWVudHNlIGluIGFycmF5XG5zZWxlY3RfdGV4dCA9IChjbG9uZXMsd29yZHMscmVncykgLT5cbiAgZm9yIGQgaW4gY2xvbmVzXG4gICAgZC5nb3ZfbmFtZT1zdHJvbmdpZnkoZC5nb3ZfbmFtZSwgd29yZHMsIHJlZ3MpXG4gICAgI2Quc3RhdGU9c3Ryb25naWZ5KGQuc3RhdGUsIHdvcmRzLCByZWdzKVxuICAgICNkLmdvdl90eXBlPXN0cm9uZ2lmeShkLmdvdl90eXBlLCB3b3JkcywgcmVncylcbiAgXG4gIHJldHVybiBjbG9uZXNcblxuXG5cbiMgaW5zZXJ0cyA8c3Ryb25nPiBlbGVtZW50c2VcbnN0cm9uZ2lmeSA9IChzLCB3b3JkcywgcmVncykgLT5cbiAgcmVncy5mb3JFYWNoIChyLGkpIC0+XG4gICAgcyA9IHMucmVwbGFjZSByLCBcIjxiPiN7d29yZHNbaV19PC9iPlwiXG4gIHJldHVybiBzXG5cbiMgcmVtb3ZlcyA8PiB0YWdzIGZyb20gYSBzdHJpbmdcbnN0cmlwID0gKHMpIC0+XG4gIHMucmVwbGFjZSgvPFtePD5dKj4vZywnJylcblxuXG4jIGFsbCB0aXJtcyBzcGFjZXMgZnJvbSBib3RoIHNpZGVzIGFuZCBtYWtlIGNvbnRyYWN0cyBzZXF1ZW5jZXMgb2Ygc3BhY2VzIHRvIDFcbmZ1bGxfdHJpbSA9IChzKSAtPlxuICBzcz1zLnRyaW0oJycrcylcbiAgc3M9c3MucmVwbGFjZSgvICsvZywnICcpXG5cbiMgcmV0dXJucyBhbiBhcnJheSBvZiB3b3JkcyBpbiBhIHN0cmluZ1xuZ2V0X3dvcmRzID0gKHN0cikgLT5cbiAgZnVsbF90cmltKHN0cikuc3BsaXQoJyAnKVxuXG5cbmdldF93b3Jkc19yZWdzID0gKHN0cikgLT5cbiAgd29yZHMgPSBnZXRfd29yZHMgc3RyXG4gIHJlZ3MgPSB3b3Jkcy5tYXAgKHcpLT4gbmV3IFJlZ0V4cChcIiN7d31cIiwnaWcnKVxuICBbd29yZHMscmVnc11cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFF1ZXJ5TWF0aGVyXG5cbiIsIlxuIyMjXG4jIGZpbGU6IHRlbXBsYXRlczIuY29mZmVlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiNcbiMgQ2xhc3MgdG8gbWFuYWdlIHRlbXBsYXRlcyBhbmQgcmVuZGVyIGRhdGEgb24gaHRtbCBwYWdlLlxuI1xuIyBUaGUgbWFpbiBtZXRob2QgOiByZW5kZXIoZGF0YSksIGdldF9odG1sKGRhdGEpXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyMjXG5cblxuXG4jIExPQUQgRklFTEQgTkFNRVMgXG5maWVsZE5hbWVzID0ge31cblxubG9hZF9maWVsZF9uYW1lcyA9ICh1cmwpIC0+XG4gICQuYWpheFxuICAgIHVybDogdXJsXG4gICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgIGNhY2hlOiB0cnVlXG4gICAgc3VjY2VzczogKGZpZWxkbmFtZXNfanNvbikgPT5cbiAgICAgIGZpZWxkTmFtZXMgPSBmaWVsZG5hbWVzX2pzb25cbiAgICAgIHJldHVyblxuICAgIGVycm9yOihlKS0+XG4gICAgICBjb25zb2xlLmxvZyBlXG5cblxubG9hZF9maWVsZF9uYW1lcyhcImNvbmZpZy9maWVsZG5hbWVzLmpzb25cIilcblxuXG5cbnJlbmRlcl9maWVsZF92YWx1ZSA9KG4sZGF0YSkgLT5cbiAgdj1kYXRhW25dXG4gIGlmIG4gPT0gXCJ3ZWJfc2l0ZVwiXG4gICAgcmV0dXJuIFwiPGEgdGFyZ2V0PSdfYmxhbmsnIGhyZWY9JyN7dn0nPiN7dn08L2E+XCJcbiAgZWxzZVxuICAgIHJldHVybiB2XG4gIFxuICBcblxucmVuZGVyX2ZpZWxkX25hbWUgPSAoZk5hbWUpIC0+XG4gIGlmIGZpZWxkTmFtZXNbZk5hbWVdP1xuICAgIHJldHVybiBmaWVsZE5hbWVzW2ZOYW1lXVxuXG4gIHMgPSBmTmFtZS5yZXBsYWNlKC9fL2csXCIgXCIpXG4gIHMgPSBzLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcy5zdWJzdHJpbmcoMSlcbiAgcmV0dXJuIHNcblxuXG5yZW5kZXJfZmllbGQgPSAoZk5hbWUsZGF0YSktPlxuICByZXR1cm4gJycgIHVubGVzcyBmVmFsdWUgPSBkYXRhW2ZOYW1lXVxuICBcIlwiXCJcbiAgPGRpdj5cbiAgICAgIDxzcGFuIGNsYXNzPSdmLW5hbSc+I3tyZW5kZXJfZmllbGRfbmFtZSBmTmFtZX08L3NwYW4+XG4gICAgICA8c3BhbiBjbGFzcz0nZi12YWwnPiN7cmVuZGVyX2ZpZWxkX3ZhbHVlKGZOYW1lLGRhdGEpfTwvc3Bhbj5cbiAgPC9kaXY+XG4gIFwiXCJcIlxuXG5cblxuICBcbnJlbmRlcl9maWVsZHMgPSggZmllbGRzLCBkYXRhKSAtPlxuICAoIHJlbmRlcl9maWVsZChmLCBkYXRhKSBmb3IgZiBpbiBmaWVsZHMpLmpvaW4oJycpXG5cblxuXG5cbiAgXG51bmRlciA9IChzKSAtPiBzLnJlcGxhY2UoLyAvZywgJ18nKVxuXG5cbnJlbmRlcl90YWJzID0gKGluaXRpYWxfbGF5b3V0LCBkYXRhKSAtPlxuICBsYXlvdXQgPSBhZGRfb3RoZXJfdGFiX3RvX2xheW91dCBpbml0aWFsX2xheW91dCwgZGF0YVxuICAjcmVuZGVyIGhlYWRlclxuICBoID0gJzxkaXYgcm9sZT1cInRhYnBhbmVsXCIgPidcblxuICAjcmVuZGVyIHRhYnNcbiAgaCArPSc8dWwgaWQ9XCJmaWVsZFRhYnNcIiBjbGFzcz1cIm5hdiBuYXYtdGFic1wiIHJvbGU9XCJ0YWJsaXN0XCI+J1xuICBcbiAgZm9yIHRhYixpIGluIGxheW91dFxuICAgIGFjdGl2ZSA9IGlmIGk+MCB0aGVuICcnIGVsc2UgJ2FjdGl2ZSdcbiAgICBoICs9XCJcIlwiXG4gICAgICA8bGkgcm9sZT1cInByZXNlbnRhdGlvblwiIGNsYXNzPVwiI3thY3RpdmV9XCIgb25jbGljaz1cInJlbWVtYmVyX3RhYignI3t1bmRlcih0YWIubmFtZSl9JylcIj5cbiAgICAgICAgPGEgaHJlZj1cIiMje3VuZGVyKHRhYi5uYW1lKX1cIiBhcmlhLWNvbnRyb2xzPVwiaG9tZVwiIHJvbGU9XCJ0YWJcIiBkYXRhLXRvZ2dsZT1cInRhYlwiPlxuICAgICAgICAje3RhYi5uYW1lfVxuICAgICAgICA8L2E+XG4gICAgICA8L2xpPlxuICAgIFwiXCJcIlxuXG4gIGggKz0gJzwvdWw+J1xuICBoICs9ICc8ZGl2IGNsYXNzPVwidGFiLWNvbnRlbnRcIj4nXG5cbiAgI3JlbmRlciB0YWJzIGNvbnRlbnRcbiAgZm9yIHRhYixpIGluIGxheW91dFxuICAgIGFjdGl2ZSA9IGlmIGk+MCB0aGVuICcnIGVsc2UgJ2FjdGl2ZSdcbiAgICBoICs9XCJcIlwiXG4gICAgPGRpdiByb2xlPVwidGFicGFuZWxcIiBjbGFzcz1cInRhYi1wYW5lICN7YWN0aXZlfVwiIGlkPVwiI3t1bmRlcih0YWIubmFtZSl9XCIgc3R5bGU9XCJwYWRkaW5nLXRvcDogNDBweDtcIj5cbiAgICAgICAgI3tyZW5kZXJfZmllbGRzIHRhYi5maWVsZHMsIGRhdGF9XG4gICAgPC9kaXY+XG4gICAgXCJcIlwiXG4gIFxuICAjcmVuZGVyIGZvb3RlclxuICBoICs9JzwvZGl2PidcbiAgaCArPSc8L2Rpdj4nXG4gIHJldHVybiBoXG5cblxuZ2V0X2xheW91dF9maWVsZHMgPSAobGEpIC0+XG4gIGYgPSB7fVxuICBmb3IgdCBpbiBsYVxuICAgIGZvciBmaWVsZCBpbiB0LmZpZWxkc1xuICAgICAgZltmaWVsZF0gPSAxXG4gIHJldHVybiBmXG5cbmdldF9yZWNvcmRfZmllbGRzID0gKHIpIC0+XG4gIGYgPSB7fVxuICBmb3IgZmllbGRfbmFtZSBvZiByXG4gICAgZltmaWVsZF9uYW1lXSA9IDFcbiAgcmV0dXJuIGZcblxuZ2V0X3VubWVudGlvbmVkX2ZpZWxkcyA9IChsYSwgcikgLT5cbiAgbGF5b3V0X2ZpZWxkcyA9IGdldF9sYXlvdXRfZmllbGRzIGxhXG4gIHJlY29yZF9maWVsZHMgPSBnZXRfcmVjb3JkX2ZpZWxkcyByXG4gIHVubWVudGlvbmVkX2ZpZWxkcyA9IFtdXG4gIFxuICAjZm9yIGYgb2YgcmVjb3JkX2ZpZWxkc1xuICAjICBpZiBub3QgbGF5b3V0X2ZpZWxkc1tmXVxuICAjICAgIHVubWVudGlvbmVkX2ZpZWxkcy5wdXNoIGZcbiAgXG4gIHVubWVudGlvbmVkX2ZpZWxkcy5wdXNoKGYpIGZvciBmIG9mIHJlY29yZF9maWVsZHMgd2hlbiBub3QgbGF5b3V0X2ZpZWxkc1tmXVxuXG4gIHJldHVybiB1bm1lbnRpb25lZF9maWVsZHNcblxuXG5hZGRfb3RoZXJfdGFiX3RvX2xheW91dCA9IChsYXlvdXQ9W10sIGRhdGEpIC0+XG4gICNjbG9uZSB0aGUgbGF5b3V0XG4gIGwgPSAkLmV4dGVuZCB0cnVlLCBbXSwgbGF5b3V0XG4gIHQgPVxuICAgIG5hbWU6IFwiT3RoZXJcIlxuICAgIGZpZWxkczogZ2V0X3VubWVudGlvbmVkX2ZpZWxkcyBsLCBkYXRhXG5cbiAgbC5wdXNoIHRcbiAgcmV0dXJuIGxcblxuXG5cblxuY2xhc3MgVGVtcGxhdGVzMlxuXG4gIEBsaXN0ID0gdW5kZWZpbmVkXG5cbiAgY29uc3RydWN0b3I6KCkgLT5cbiAgICBAbGlzdCA9IFtdXG5cbiAgYWRkX3RlbXBsYXRlOiAobGF5b3V0X25hbWUsIGxheW91dF9qc29uKSAtPlxuICAgIEBsaXN0LnB1c2hcbiAgICAgIG5hbWU6bGF5b3V0X25hbWVcbiAgICAgIHJlbmRlcjooZGF0KSAtPlxuICAgICAgICByZW5kZXJfdGFicyhsYXlvdXRfanNvbiwgZGF0KVxuXG5cbiAgbG9hZF90ZW1wbGF0ZToodGVtcGxhdGVfbmFtZSwgdXJsKSAtPlxuICAgICQuYWpheFxuICAgICAgdXJsOiB1cmxcbiAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgIGNhY2hlOiB0cnVlXG4gICAgICBzdWNjZXNzOiAodGVtcGxhdGVfanNvbikgPT5cbiAgICAgICAgQGFkZF90ZW1wbGF0ZSh0ZW1wbGF0ZV9uYW1lLCB0ZW1wbGF0ZV9qc29uKVxuICAgICAgICByZXR1cm5cblxuXG4gIGdldF9uYW1lczogLT5cbiAgICAodC5uYW1lIGZvciB0IGluIEBsaXN0KVxuXG4gIGdldF9pbmRleF9ieV9uYW1lOiAobmFtZSkgLT5cbiAgICBmb3IgdCxpIGluIEBsaXN0XG4gICAgICBpZiB0Lm5hbWUgaXMgbmFtZVxuICAgICAgICByZXR1cm4gaVxuICAgICByZXR1cm4gLTFcblxuICBnZXRfaHRtbDogKGluZCwgZGF0YSkgLT5cbiAgICBpZiAoaW5kIGlzIC0xKSB0aGVuIHJldHVybiAgXCJcIlxuICAgIFxuICAgIGlmIEBsaXN0W2luZF1cbiAgICAgIHJldHVybiBAbGlzdFtpbmRdLnJlbmRlcihkYXRhKVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBcIlwiXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFRlbXBsYXRlczJcbiJdfQ==
