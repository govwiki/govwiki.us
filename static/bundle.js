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
var GovSelector, Templates2, _jqgs, activate_tab, active_tab, build_select_element, build_selector, get_record, gov_selector, govmap, templates;

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
  s = "<select class='form-control'><option value=''>" + text + "</option>";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvdmFkaW1pdmxldi9Qcm9qZWN0cy9fcHJvamVjdHMvZ292d2lraS51cy9jb2ZmZWUvZ292bWFwLmNvZmZlZSIsIi9Vc2Vycy92YWRpbWl2bGV2L1Byb2plY3RzL19wcm9qZWN0cy9nb3Z3aWtpLnVzL2NvZmZlZS9nb3ZzZWxlY3Rvci5jb2ZmZWUiLCIvVXNlcnMvdmFkaW1pdmxldi9Qcm9qZWN0cy9fcHJvamVjdHMvZ292d2lraS51cy9jb2ZmZWUvanF1ZXJ5LmdvdnNlbGVjdG9yLmNvZmZlZSIsIi9Vc2Vycy92YWRpbWl2bGV2L1Byb2plY3RzL19wcm9qZWN0cy9nb3Z3aWtpLnVzL2NvZmZlZS9tYWluLmNvZmZlZSIsIi9Vc2Vycy92YWRpbWl2bGV2L1Byb2plY3RzL19wcm9qZWN0cy9nb3Z3aWtpLnVzL2NvZmZlZS9xdWVyeW1hdGNoZXIuY29mZmVlIiwiL1VzZXJzL3ZhZGltaXZsZXYvUHJvamVjdHMvX3Byb2plY3RzL2dvdndpa2kudXMvY29mZmVlL3RlbXBsYXRlczIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSwyQ0FBQTs7QUFBQSxRQUFBLEdBQWUsSUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQWIsQ0FDYiwrRUFEYSxFQUVULElBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFiLENBQW1CLEVBQW5CLEVBQXVCLEVBQXZCLENBRlMsRUFHVCxJQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBYixDQUFvQixDQUFwQixFQUF1QixDQUF2QixDQUhTLEVBSVQsSUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQWIsQ0FBb0IsRUFBcEIsRUFBd0IsRUFBeEIsQ0FKUyxDQUFmLENBQUE7O0FBQUEs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QVUsSUFBYjtBQUNFLGVBQU8sQ0FBUCxDQURGO09BREY7QUFBQSxLQUFBO0FBR0MsV0FBTyxDQUFBLENBQVAsQ0FKZ0I7RUFBQSxDQXpCbkIsQ0FBQTs7QUFBQSx1QkErQkEsUUFBQSxHQUFVLFNBQUMsR0FBRCxFQUFNLElBQU4sR0FBQTtBQUNSLElBQUEsSUFBSSxHQUFBLEtBQU8sQ0FBQSxDQUFYO0FBQW9CLGFBQVEsRUFBUixDQUFwQjtLQUFBO0FBRUEsSUFBQSxJQUFHLElBQUMsQ0FBQSxJQUFLLENBQUEsR0FBQSxDQUFUO0FBQ0UsYUFBTyxJQUFDLENBQUEsSUFBSyxDQUFBLEdBQUEsQ0FBSSxDQUFDLE1BQVgsQ0FBa0IsSUFBbEIsQ0FBUCxDQURGO0tBQUEsTUFBQTtBQUdFLGFBQU8sRUFBUCxDQUhGO0tBSFE7RUFBQSxDQS9CVixDQUFBOztvQkFBQTs7SUFwSkYsQ0FBQTs7QUFBQSxNQTZMTSxDQUFDLE9BQVAsR0FBaUIsVUE3TGpCLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwicGluSW1hZ2UgPSBuZXcgKGdvb2dsZS5tYXBzLk1hcmtlckltYWdlKShcbiAgJ2h0dHA6Ly9jaGFydC5hcGlzLmdvb2dsZS5jb20vY2hhcnQ/Y2hzdD1kX21hcF9waW5fbGV0dGVyJmNobGQ9Wnw3Nzc3QkJ8RkZGRkZGJyAsXG4gIG5ldyAoZ29vZ2xlLm1hcHMuU2l6ZSkoMjEsIDM0KSxcbiAgbmV3IChnb29nbGUubWFwcy5Qb2ludCkoMCwgMCksXG4gIG5ldyAoZ29vZ2xlLm1hcHMuUG9pbnQpKDEwLCAzNClcbiAgKVxuXG5cbm1hcCA9IG5ldyBHTWFwc1xuICBlbDogJyNnb3ZtYXAnXG4gIGxhdDogLTEyLjA0MzMzM1xuICBsbmc6IC03Ny4wMjgzMzNcbiAgem9vbToxNFxuXG5nZW9jb2RlX2FkZHIgPSAoYWRkcixkYXRhKSAtPlxuICBHTWFwcy5nZW9jb2RlXG4gICAgYWRkcmVzczogYWRkclxuICAgIGNhbGxiYWNrOiAocmVzdWx0cywgc3RhdHVzKSAtPlxuICAgICAgaWYgc3RhdHVzID09ICdPSydcbiAgICAgICAgbGF0bG5nID0gcmVzdWx0c1swXS5nZW9tZXRyeS5sb2NhdGlvblxuICAgICAgICBtYXAuc2V0Q2VudGVyIGxhdGxuZy5sYXQoKSwgbGF0bG5nLmxuZygpXG4gICAgICAgIG1hcC5hZGRNYXJrZXJcbiAgICAgICAgICBsYXQ6IGxhdGxuZy5sYXQoKVxuICAgICAgICAgIGxuZzogbGF0bG5nLmxuZygpXG4gICAgICAgICAgc2l6ZTogJ3NtYWxsJ1xuICAgICAgICAgIHRpdGxlOiByZXN1bHRzWzBdLmZvcm1hdHRlZF9hZGRyZXNzXG4gICAgICAgICAgaW5mb1dpbmRvdzpcbiAgICAgICAgICAgIGNvbnRlbnQ6IHJlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3NcbiAgICAgICAgXG4gICAgICAgIGlmIGRhdGFcbiAgICAgICAgICBtYXAuYWRkTWFya2VyXG4gICAgICAgICAgICBsYXQ6IGRhdGEubGF0aXR1ZGVcbiAgICAgICAgICAgIGxuZzogZGF0YS5sb25naXR1ZGVcbiAgICAgICAgICAgIHNpemU6ICdzbWFsbCdcbiAgICAgICAgICAgIGNvbG9yOiAnYmx1ZSdcbiAgICAgICAgICAgIGljb246IHBpbkltYWdlXG4gICAgICAgICAgICB0aXRsZTogIFwiI3tkYXRhLmxhdGl0dWRlfSAje2RhdGEubG9uZ2l0dWRlfVwiXG4gICAgICAgICAgICBpbmZvV2luZG93OlxuICAgICAgICAgICAgICBjb250ZW50OiBcIiN7ZGF0YS5sYXRpdHVkZX0gI3tkYXRhLmxvbmdpdHVkZX1cIlxuICAgICAgICAgICAgXG4gICAgICAgICQoJy5nb3ZtYXAtZm91bmQnKS5odG1sIFwiPHN0cm9uZz5GT1VORDogPC9zdHJvbmc+I3tyZXN1bHRzWzBdLmZvcm1hdHRlZF9hZGRyZXNzfVwiXG4gICAgICByZXR1cm5cblxuY2xlYXI9KHMpLT5cbiAgcmV0dXJuIGlmIHMubWF0Y2goLyBib3ggL2kpIHRoZW4gJycgZWxzZSBzXG5cblxuXG5nZW9jb2RlID0gKGRhdGEpIC0+XG4gIGFkZHIgPSBcIiN7Y2xlYXIoZGF0YS5hZGRyZXNzMSl9ICN7Y2xlYXIoZGF0YS5hZGRyZXNzMil9LCAje2RhdGEuY2l0eX0sICN7ZGF0YS5zdGF0ZX0gI3tkYXRhLnppcH0sIFVTQVwiXG4gICQoJyNnb3ZhZGRyZXNzJykudmFsKGFkZHIpXG4gIGdlb2NvZGVfYWRkciBhZGRyLCBkYXRhXG5cblwiMSBEb2N0b3IgQ2FybHRvbiBCIEdvb2RsZXR0IFBsYWNlLCBTYW4gRnJhbmNpc2NvLCBDQSA5NDEwMiwgVVNBXCJcblxubW9kdWxlLmV4cG9ydHMgPVxuICBnZW9jb2RlOiBnZW9jb2RlXG4gIGdvY29kZV9hZGRyOiBnZW9jb2RlX2FkZHJcblxuIiwiXG5xdWVyeV9tYXRjaGVyID0gcmVxdWlyZSgnLi9xdWVyeW1hdGNoZXIuY29mZmVlJylcblxuY2xhc3MgR292U2VsZWN0b3JcbiAgXG4gICMgc3R1YiBvZiBhIGNhbGxiYWNrIHRvIGVudm9rZSB3aGVuIHRoZSB1c2VyIHNlbGVjdHMgc29tZXRoaW5nXG4gIG9uX3NlbGVjdGVkOiAoZXZ0LCBkYXRhLCBuYW1lKSAtPlxuXG5cbiAgY29uc3RydWN0b3I6IChAaHRtbF9zZWxlY3RvciwgZG9jc191cmwsIEBudW1faXRlbXMpIC0+XG4gICAgJC5hamF4XG4gICAgICB1cmw6IGRvY3NfdXJsXG4gICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICBjYWNoZTogdHJ1ZVxuICAgICAgc3VjY2VzczogQHN0YXJ0U3VnZ2VzdGlvblxuICAgICAgXG5cblxuXG4gIHN1Z2dlc3Rpb25UZW1wbGF0ZSA6IEhhbmRsZWJhcnMuY29tcGlsZShcIlwiXCJcbiAgICA8ZGl2IGNsYXNzPVwic3VnZy1ib3hcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJzdWdnLXN0YXRlXCI+e3t7c3RhdGV9fX08L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJzdWdnLW5hbWVcIj57e3tnb3ZfbmFtZX19fTwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cInN1Z2ctdHlwZVwiPnt7e2dvdl90eXBlfX19PC9kaXY+XG4gICAgPC9kaXY+XCJcIlwiKVxuXG5cblxuICBlbnRlcmVkX3ZhbHVlID0gXCJcIlxuXG4gIGdvdnNfYXJyYXkgPSBbXVxuXG4gIGNvdW50X2dvdnMgOiAoKSAtPlxuICAgIGNvdW50ID0wXG4gICAgZm9yIGQgaW4gQGdvdnNfYXJyYXlcbiAgICAgIGlmIEdPVldJS0kuc3RhdGVfZmlsdGVyIGFuZCBkLnN0YXRlIGlzbnQgR09WV0lLSS5zdGF0ZV9maWx0ZXIgdGhlbiBjb250aW51ZVxuICAgICAgaWYgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXIgYW5kIGQuZ292X3R5cGUgaXNudCBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlciB0aGVuIGNvbnRpbnVlXG4gICAgICBjb3VudCsrXG4gICAgcmV0dXJuIGNvdW50XG5cblxuICBzdGFydFN1Z2dlc3Rpb24gOiAoZ292cykgPT5cbiAgICBAZ292c19hcnJheSA9IGdvdnNcbiAgICAkKCcudHlwZWFoZWFkJykua2V5dXAgKGV2ZW50KSA9PlxuICAgICAgQGVudGVyZWRfdmFsdWUgPSAkKGV2ZW50LnRhcmdldCkudmFsKClcbiAgICBcbiAgICAkKEBodG1sX3NlbGVjdG9yKS5hdHRyICdwbGFjZWhvbGRlcicsICdHT1ZFUk5NRU5UIE5BTUUnXG4gICAgJChAaHRtbF9zZWxlY3RvcikudHlwZWFoZWFkKFxuICAgICAgICBoaW50OiBmYWxzZVxuICAgICAgICBoaWdobGlnaHQ6IGZhbHNlXG4gICAgICAgIG1pbkxlbmd0aDogMVxuICAgICAgLFxuICAgICAgICBuYW1lOiAnZ292X25hbWUnXG4gICAgICAgIGRpc3BsYXlLZXk6ICdnb3ZfbmFtZSdcbiAgICAgICAgc291cmNlOiBxdWVyeV9tYXRjaGVyKGdvdnMsIEBudW1faXRlbXMpXG4gICAgICAgICNzb3VyY2U6IGJsb29kaG91bmQudHRBZGFwdGVyKClcbiAgICAgICAgdGVtcGxhdGVzOiBzdWdnZXN0aW9uOiBAc3VnZ2VzdGlvblRlbXBsYXRlXG4gICAgKVxuICAgIC5vbiAndHlwZWFoZWFkOnNlbGVjdGVkJywgIChldnQsIGRhdGEsIG5hbWUpID0+XG4gICAgICAgICQoJy50eXBlYWhlYWQnKS50eXBlYWhlYWQgJ3ZhbCcsIEBlbnRlcmVkX3ZhbHVlXG4gICAgICAgIEBvbl9zZWxlY3RlZChldnQsIGRhdGEsIG5hbWUpXG4gICBcbiAgICAub24gJ3R5cGVhaGVhZDpjdXJzb3JjaGFuZ2VkJywgKGV2dCwgZGF0YSwgbmFtZSkgPT5cbiAgICAgICAgJCgnLnR5cGVhaGVhZCcpLnZhbCBAZW50ZXJlZF92YWx1ZVxuICAgIFxuXG4gICAgJCgnLmdvdi1jb3VudGVyJykudGV4dCBAY291bnRfZ292cygpXG4gICAgcmV0dXJuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHM9R292U2VsZWN0b3JcblxuXG5cbiIsIigoJCkgLT5cblxuICAkLmdvdnNlbGVjdG9yID0gKGVsLCBvcHRpb25zKSAtPlxuXG4gICAgIyBUbyBhdm9pZCBzY29wZSBpc3N1ZXMsIHVzZSAnYmFzZScgaW5zdGVhZCBvZiAndGhpcydcbiAgICAjIHRvIHJlZmVyZW5jZSB0aGlzIGNsYXNzIGZyb20gaW50ZXJuYWwgZXZlbnRzIGFuZCBmdW5jdGlvbnMuXG4gICAgYmFzZSA9IHRoaXNcbiAgICBcbiAgICBcbiAgICAjIEFjY2VzcyB0byBqUXVlcnkgYW5kIERPTSB2ZXJzaW9ucyBvZiBlbGVtZW50XG4gICAgYmFzZS4kZWwgPSAkKGVsKVxuICAgIGJhc2UuZWwgPSBlbFxuICAgIFxuICAgIFxuICAgICMgQWRkIGEgcmV2ZXJzZSByZWZlcmVuY2UgdG8gdGhlIERPTSBvYmplY3RcbiAgICBiYXNlLiRlbC5kYXRhICdnb3ZzZWxlY3RvcicsIGJhc2VcblxuICAgICMgZGVsYXkgdXNhZ2VcbiAgICAjJCgnaW5wdXQnKS5rZXl1cCAtPlxuICAgICMgIGRlbGF5ICgtPiBhbGVydCAnVGltZSBlbGFwc2VkISc7IHJldHVybiksIDEwMDBcbiAgICAjICByZXR1cm5cbiAgICAgIFxuICAgIGRlbGF5ID0gZG8gLT5cbiAgICAgIHRpbWVyID0gMFxuICAgICAgKGNhbGxiYWNrLCBtcykgLT5cbiAgICAgICAgY2xlYXJUaW1lb3V0IHRpbWVyXG4gICAgICAgIHRpbWVyID0gc2V0VGltZW91dChjYWxsYmFjaywgbXMpXG4gICAgICAgIHJldHVyblxuICAgIFxuICAgIG9ua2V5dXAgPSAoZXZlbnQpIC0+XG4gICAgICBzd2l0Y2ggIGV2ZW50LndoaWNoXG4gICAgICAgICMgRW50ZXJcbiAgICAgICAgd2hlbiAxM1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAkKCcudHlwZWFoZWFkJykudHlwZWFoZWFkICd2YWwnLCBiYXNlLiRlbC52YWwoKVxuICAgICAgICAgICQoJy50eXBlYWhlYWQnKS50eXBlYWhlYWQgJ29wZW4nXG4gICAgICAgICMgRXNjXG4gICAgICAgIHdoZW4gMjdcbiAgICAgICAgICAkKCcudHlwZWFoZWFkJykudHlwZWFoZWFkICdjbG9zZSdcbiAgICAgICAgIyBVcFxuICAgICAgICB3aGVuIDM4IHRoZW5cbiAgICAgICAgIyBEb3duXG4gICAgICAgIHdoZW4gNDAgdGhlblxuICAgICAgICBlbHNlXG4gICAgICAgICAgJCgnLnR5cGVhaGVhZCcpLnR5cGVhaGVhZCAndmFsJywgYmFzZS4kZWwudmFsKClcbiAgICAgICAgICAkKCcudHlwZWFoZWFkJykudHlwZWFoZWFkICdvcGVuJ1xuICAgICAgI2V2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIGNvbnNvbGUubG9nIGV2ZW50LndoaWNoXG4gICAgICByZXR1cm5cblxuICAgIGJsdXIgPSAoZXZlbnQpIC0+XG4gICAgICBjb25zb2xlLmxvZyAnYmx1cidcbiAgICBcbiAgICBiYXNlLmluaXQgPSAtPlxuICAgICAgYmFzZS5vcHRpb25zID0gJC5leHRlbmQoe30sICQuZ292c2VsZWN0b3IuZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpXG4gICAgICAjIFB1dCB5b3VyIGluaXRpYWxpemF0aW9uIGNvZGUgaGVyZVxuICAgICAgYmFzZS4kZWwuY3NzICdiYWNrZ3JvdW5kLWNvbG9yJywgJ3doaXRlJ1xuICAgICAgYmFzZS4kZWwua2V5dXAgb25rZXl1cFxuICAgICAgYmFzZS4kZWwuYmx1ciBvbmJsdXJcblxuICAgICAgcmV0dXJuXG5cbiAgICBcbiAgICAjIFNhbXBsZSBGdW5jdGlvbiwgVW5jb21tZW50IHRvIHVzZVxuICAgICMgYmFzZS5mdW5jdGlvbk5hbWUgPSBmdW5jdGlvbihwYXJhbWF0ZXJzKXtcbiAgICAjXG4gICAgIyB9O1xuICAgIFxuICAgIFxuICAgICMgUnVuIGluaXRpYWxpemVyXG4gICAgYmFzZS5pbml0KClcbiAgICByZXR1cm5cblxuICAgIFxuICAkLmdvdnNlbGVjdG9yLmRlZmF1bHRPcHRpb25zID1cbiAgICByb3dzOiA1XG4gICAgdGVtcGxhdGU6ICd7e319J1xuXG4gICAgXG4gICQuZm4uZ292c2VsZWN0b3IgPSAob3B0aW9ucykgLT5cbiAgICBAZWFjaCAtPlxuICAgICAgbmV3ICgkLmdvdnNlbGVjdG9yKSh0aGlzLCBvcHRpb25zKVxuICAgICAgcmV0dXJuXG5cbiAgICBcbiAgIyBUaGlzIGZ1bmN0aW9uIGJyZWFrcyB0aGUgY2hhaW4sIGJ1dCByZXR1cm5zXG4gICMgdGhlIGdvdnNlbGVjdG9yIGlmIGl0IGhhcyBiZWVuIGF0dGFjaGVkIHRvIHRoZSBvYmplY3QuXG4gICQuZm4uZ2V0Z292c2VsZWN0b3IgPSAtPlxuICAgIEBkYXRhICdnb3ZzZWxlY3RvcidcbiAgICByZXR1cm5cblxuICAgIFxuICByZXR1cm5cbikgalF1ZXJ5XG4iLCIjIyNcbmZpbGU6IG1haW4uY29mZmUgLS0gVGhlIGVudHJ5IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIDpcbmdvdl9maW5kZXIgPSBuZXcgR292RmluZGVyXG5nb3ZfZGV0YWlscyA9IG5ldyBHb3ZEZXRhaWxzXG5nb3ZfZmluZGVyLm9uX3NlbGVjdCA9IGdvdl9kZXRhaWxzLnNob3dcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIyNcblxuR292U2VsZWN0b3IgPSByZXF1aXJlICcuL2dvdnNlbGVjdG9yLmNvZmZlZSdcbl9qcWdzICAgICAgID0gcmVxdWlyZSAnLi9qcXVlcnkuZ292c2VsZWN0b3IuY29mZmVlJ1xuVGVtcGxhdGVzMiAgICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMyLmNvZmZlZSdcbmdvdm1hcCAgICAgID0gcmVxdWlyZSAnLi9nb3ZtYXAuY29mZmVlJ1xuXG53aW5kb3cuR09WV0lLSSA9XG4gIHN0YXRlX2ZpbHRlciA6ICcnXG4gIGdvdl90eXBlX2ZpbHRlciA6ICcnXG5cblxuXG5cblxuXG5nb3Zfc2VsZWN0b3IgPSBuZXcgR292U2VsZWN0b3IgJy50eXBlYWhlYWQnLCAnZGF0YS9oX3R5cGVzLmpzb24nLCA3XG50ZW1wbGF0ZXMgPSBuZXcgVGVtcGxhdGVzMlxuYWN0aXZlX3RhYj1cIlwiXG5cbndpbmRvdy5yZW1lbWJlcl90YWIgPShuYW1lKS0+IGFjdGl2ZV90YWIgPSBuYW1lXG5cbndpbmRvdy5nZW9jb2RlX2FkZHIgPSAoaW5wdXRfc2VsZWN0b3IpLT4gZ292bWFwLmdvY29kZV9hZGRyICQoaW5wdXRfc2VsZWN0b3IpLnZhbCgpXG5cbmFjdGl2YXRlX3RhYiA9KCkgLT5cbiAgJChcIiNmaWVsZFRhYnMgYVtocmVmPScjI3thY3RpdmVfdGFifSddXCIpLnRhYignc2hvdycpXG5cblxuZ292X3NlbGVjdG9yLm9uX3NlbGVjdGVkID0gKGV2dCwgZGF0YSwgbmFtZSkgLT5cbiAgI3JlbmRlckRhdGEgJyNkZXRhaWxzJywgZGF0YVxuICAkKCcjZGV0YWlscycpLmh0bWwgdGVtcGxhdGVzLmdldF9odG1sKDAsIGRhdGEpXG4gIGFjdGl2YXRlX3RhYigpXG4gIGdldF9yZWNvcmQgXCJpbmNfaWQ6I3tkYXRhW1wiaW5jX2lkXCJdfVwiXG4gIHJldHVyblxuXG5cbmdldF9yZWNvcmQgPSAocXVlcnkpIC0+XG4gICQuYWpheFxuICAgIHVybDogXCJodHRwczovL2FwaS5tb25nb2xhYi5jb20vYXBpLzEvZGF0YWJhc2VzL2dvdndpa2kvY29sbGVjdGlvbnMvZ292cy8/cT17I3txdWVyeX19JmY9e19pZDowfSZsPTEmYXBpS2V5PTBZNVhfUWsydU9KUmRISldKS1NSV2s2bDZKcVZUUzJ5XCJcbiAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgY2FjaGU6IHRydWVcbiAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgIGlmIGRhdGEubGVuZ3RoXG4gICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgZGF0YVswXSlcbiAgICAgICAgYWN0aXZhdGVfdGFiKClcbiAgICAgICAgJCgnI21hcGFyZWEnKS5jc3MoJ3Zpc2liaWxpdHknLCd2aXNpYmxlJylcbiAgICAgICAgZ292bWFwLmdlb2NvZGUgZGF0YVswXVxuICAgICAgcmV0dXJuXG4gICAgZXJyb3I6KGUpIC0+XG4gICAgICBjb25zb2xlLmxvZyBlXG5cblxuXG5cblxuJCgnI21hcGFyZWEnKS5jc3MoJ3Zpc2liaWxpdHknLCdoaWRkZW4nKVxuXG5cbnRlbXBsYXRlcy5sb2FkX3RlbXBsYXRlIFwidGFic1wiLCBcImNvbmZpZy90YWJsYXlvdXQuanNvblwiXG5cblxuYnVpbGRfc2VsZWN0b3IgPSAoY29udGFpbmVyLCB0ZXh0LCB1cmwsIHdoZXJlX3RvX3N0b3JlX3ZhbHVlICkgLT5cbiAgJC5hamF4XG4gICAgdXJsOiB1cmxcbiAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgY2FjaGU6IHRydWVcbiAgICBzdWNjZXNzOiAoZGF0YSkgPT5cbiAgICAgICNhPSQuZXh0ZW5kIHRydWUgW10sZGF0YVxuICAgICAgYnVpbGRfc2VsZWN0X2VsZW1lbnQgY29udGFpbmVyLCB0ZXh0LCBkYXRhLnNvcnQoKSwgd2hlcmVfdG9fc3RvcmVfdmFsdWVcbiAgICAgIHJldHVyblxuICAgIGVycm9yOihlKSAtPlxuICAgICAgY29uc29sZS5sb2cgZVxuXG5cbmJ1aWxkX3NlbGVjdF9lbGVtZW50ID0gKGNvbnRhaW5lciwgdGV4dCwgYXJyLCB3aGVyZV90b19zdG9yZV92YWx1ZSApIC0+XG4gIHMgID0gXCI8c2VsZWN0IGNsYXNzPSdmb3JtLWNvbnRyb2wnPjxvcHRpb24gdmFsdWU9Jyc+I3t0ZXh0fTwvb3B0aW9uPlwiXG4gIHMgKz0gXCI8b3B0aW9uIHZhbHVlPScje3Z9Jz4je3Z9PC9vcHRpb24+XCIgZm9yIHYgaW4gYXJyXG4gIHMgKz0gXCI8L3NlbGVjdD5cIlxuICBzZWxlY3QgPSAkKHMpXG4gICQoY29udGFpbmVyKS5hcHBlbmQoc2VsZWN0KVxuICBzZWxlY3QuY2hhbmdlIChlKSAtPlxuICAgIGVsID0gJChlLnRhcmdldClcbiAgICB3aW5kb3cuR09WV0lLSVt3aGVyZV90b19zdG9yZV92YWx1ZV0gPSBlbC52YWwoKVxuICAgICQoJy5nb3YtY291bnRlcicpLnRleHQgZ292X3NlbGVjdG9yLmNvdW50X2dvdnMoKVxuXG5cbmJ1aWxkX3NlbGVjdG9yKCcuc3RhdGUtY29udGFpbmVyJ1xuICAsICdTdGF0ZS4uJ1xuICAsICdkYXRhL3N0YXRlLmpzb24nXG4gICwgJ3N0YXRlX2ZpbHRlcicpXG5cbmJ1aWxkX3NlbGVjdG9yKCcuZ292LXR5cGUtY29udGFpbmVyJ1xuICAsICd0eXBlIG9mIGdvdmVybm1lbnQuLidcbiAgLCAnZGF0YS9nb3ZfdHlwZS5qc29uJ1xuICAsICdnb3ZfdHlwZV9maWx0ZXInKVxuXG5cblxuXG5cblxuIiwiXG5cblxuIyBUYWtlcyBhbiBhcnJheSBvZiBkb2NzIHRvIHNlYXJjaCBpbi5cbiMgUmV0dXJucyBhIGZ1bmN0aW9ucyB0aGF0IHRha2VzIDIgcGFyYW1zIFxuIyBxIC0gcXVlcnkgc3RyaW5nIGFuZCBcbiMgY2IgLSBjYWxsYmFjayB0aGF0IHdpbGwgYmUgY2FsbGVkIHdoZW4gdGhlIHNlYXJjaCBpcyBkb25lLlxuIyBjYiByZXR1cm5zIGFuIGFycmF5IG9mIG1hdGNoaW5nIGRvY3VtZW50cy5cbiMgbXVtX2l0ZW1zIC0gbWF4IG51bWJlciBvZiBmb3VuZCBpdGVtcyB0byBzaG93XG5RdWVyeU1hdGhlciA9IChkb2NzLCBudW1faXRlbXM9NSkgLT5cbiAgKHEsIGNiKSAtPlxuICAgIHRlc3Rfc3RyaW5nID0ocywgcmVncykgLT5cbiAgICAgIChpZiBub3Qgci50ZXN0KHMpIHRoZW4gcmV0dXJuIGZhbHNlKSAgZm9yIHIgaW4gcmVnc1xuICAgICAgcmV0dXJuIHRydWVcblxuICAgIFt3b3JkcyxyZWdzXSA9IGdldF93b3Jkc19yZWdzIHFcbiAgICBtYXRjaGVzID0gW11cbiAgICAjIGl0ZXJhdGUgdGhyb3VnaCB0aGUgcG9vbCBvZiBkb2NzIGFuZCBmb3IgYW55IHN0cmluZyB0aGF0XG4gICAgIyBjb250YWlucyB0aGUgc3Vic3RyaW5nIGBxYCwgYWRkIGl0IHRvIHRoZSBgbWF0Y2hlc2AgYXJyYXlcblxuICAgIGZvciBkIGluIGRvY3NcbiAgICAgIGlmIG1hdGNoZXMubGVuZ3RoID49IG51bV9pdGVtcyB0aGVuIGJyZWFrXG4gICAgICBpZiBHT1ZXSUtJLnN0YXRlX2ZpbHRlciBhbmQgZC5zdGF0ZSBpc250IEdPVldJS0kuc3RhdGVfZmlsdGVyIHRoZW4gY29udGludWVcbiAgICAgIGlmIEdPVldJS0kuZ292X3R5cGVfZmlsdGVyIGFuZCBkLmdvdl90eXBlIGlzbnQgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXIgdGhlbiBjb250aW51ZVxuXG4gICAgICBpZiB0ZXN0X3N0cmluZyhkLmdvdl9uYW1lLCByZWdzKSB0aGVuIG1hdGNoZXMucHVzaCAkLmV4dGVuZCh7fSwgZClcbiAgICAgICNpZiB0ZXN0X3N0cmluZyhcIiN7ZC5nb3ZfbmFtZX0gI3tkLnN0YXRlfSAje2QuZ292X3R5cGV9ICN7ZC5pbmNfaWR9XCIsIHJlZ3MpIHRoZW4gbWF0Y2hlcy5wdXNoICQuZXh0ZW5kKHt9LCBkKVxuICAgIFxuICAgIHNlbGVjdF90ZXh0IG1hdGNoZXMsIHdvcmRzLCByZWdzXG4gICAgY2IgbWF0Y2hlc1xuICAgIHJldHVyblxuIFxuXG4jIGluc2VydHMgPHN0cm9uZz4gZWxlbWVudHNlIGluIGFycmF5XG5zZWxlY3RfdGV4dCA9IChjbG9uZXMsd29yZHMscmVncykgLT5cbiAgZm9yIGQgaW4gY2xvbmVzXG4gICAgZC5nb3ZfbmFtZT1zdHJvbmdpZnkoZC5nb3ZfbmFtZSwgd29yZHMsIHJlZ3MpXG4gICAgI2Quc3RhdGU9c3Ryb25naWZ5KGQuc3RhdGUsIHdvcmRzLCByZWdzKVxuICAgICNkLmdvdl90eXBlPXN0cm9uZ2lmeShkLmdvdl90eXBlLCB3b3JkcywgcmVncylcbiAgXG4gIHJldHVybiBjbG9uZXNcblxuXG5cbiMgaW5zZXJ0cyA8c3Ryb25nPiBlbGVtZW50c2VcbnN0cm9uZ2lmeSA9IChzLCB3b3JkcywgcmVncykgLT5cbiAgcmVncy5mb3JFYWNoIChyLGkpIC0+XG4gICAgcyA9IHMucmVwbGFjZSByLCBcIjxiPiN7d29yZHNbaV19PC9iPlwiXG4gIHJldHVybiBzXG5cbiMgcmVtb3ZlcyA8PiB0YWdzIGZyb20gYSBzdHJpbmdcbnN0cmlwID0gKHMpIC0+XG4gIHMucmVwbGFjZSgvPFtePD5dKj4vZywnJylcblxuXG4jIGFsbCB0aXJtcyBzcGFjZXMgZnJvbSBib3RoIHNpZGVzIGFuZCBtYWtlIGNvbnRyYWN0cyBzZXF1ZW5jZXMgb2Ygc3BhY2VzIHRvIDFcbmZ1bGxfdHJpbSA9IChzKSAtPlxuICBzcz1zLnRyaW0oJycrcylcbiAgc3M9c3MucmVwbGFjZSgvICsvZywnICcpXG5cbiMgcmV0dXJucyBhbiBhcnJheSBvZiB3b3JkcyBpbiBhIHN0cmluZ1xuZ2V0X3dvcmRzID0gKHN0cikgLT5cbiAgZnVsbF90cmltKHN0cikuc3BsaXQoJyAnKVxuXG5cbmdldF93b3Jkc19yZWdzID0gKHN0cikgLT5cbiAgd29yZHMgPSBnZXRfd29yZHMgc3RyXG4gIHJlZ3MgPSB3b3Jkcy5tYXAgKHcpLT4gbmV3IFJlZ0V4cChcIiN7d31cIiwnaWcnKVxuICBbd29yZHMscmVnc11cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFF1ZXJ5TWF0aGVyXG5cbiIsIlxuIyMjXG4jIGZpbGU6IHRlbXBsYXRlczIuY29mZmVlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiNcbiMgQ2xhc3MgdG8gbWFuYWdlIHRlbXBsYXRlcyBhbmQgcmVuZGVyIGRhdGEgb24gaHRtbCBwYWdlLlxuI1xuIyBUaGUgbWFpbiBtZXRob2QgOiByZW5kZXIoZGF0YSksIGdldF9odG1sKGRhdGEpXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyMjXG5cblxuXG4jIExPQUQgRklFTEQgTkFNRVMgXG5maWVsZE5hbWVzID0ge31cblxubG9hZF9maWVsZF9uYW1lcyA9ICh1cmwpIC0+XG4gICQuYWpheFxuICAgIHVybDogdXJsXG4gICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgIGNhY2hlOiB0cnVlXG4gICAgc3VjY2VzczogKGZpZWxkbmFtZXNfanNvbikgPT5cbiAgICAgIGZpZWxkTmFtZXMgPSBmaWVsZG5hbWVzX2pzb25cbiAgICAgIHJldHVyblxuICAgIGVycm9yOihlKS0+XG4gICAgICBjb25zb2xlLmxvZyBlXG5cblxubG9hZF9maWVsZF9uYW1lcyhcImNvbmZpZy9maWVsZG5hbWVzLmpzb25cIilcblxuXG5cbnJlbmRlcl9maWVsZF92YWx1ZSA9KG4sZGF0YSkgLT5cbiAgdj1kYXRhW25dXG4gIGlmIG4gPT0gXCJ3ZWJfc2l0ZVwiXG4gICAgcmV0dXJuIFwiPGEgdGFyZ2V0PSdfYmxhbmsnIGhyZWY9JyN7dn0nPiN7dn08L2E+XCJcbiAgZWxzZVxuICAgIHJldHVybiB2XG4gIFxuICBcblxucmVuZGVyX2ZpZWxkX25hbWUgPSAoZk5hbWUpIC0+XG4gIGlmIGZpZWxkTmFtZXNbZk5hbWVdP1xuICAgIHJldHVybiBmaWVsZE5hbWVzW2ZOYW1lXVxuXG4gIHMgPSBmTmFtZS5yZXBsYWNlKC9fL2csXCIgXCIpXG4gIHMgPSBzLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcy5zdWJzdHJpbmcoMSlcbiAgcmV0dXJuIHNcblxuXG5yZW5kZXJfZmllbGQgPSAoZk5hbWUsZGF0YSktPlxuICByZXR1cm4gJycgIHVubGVzcyBmVmFsdWUgPSBkYXRhW2ZOYW1lXVxuICBcIlwiXCJcbiAgPGRpdj5cbiAgICAgIDxzcGFuIGNsYXNzPSdmLW5hbSc+I3tyZW5kZXJfZmllbGRfbmFtZSBmTmFtZX08L3NwYW4+XG4gICAgICA8c3BhbiBjbGFzcz0nZi12YWwnPiN7cmVuZGVyX2ZpZWxkX3ZhbHVlKGZOYW1lLGRhdGEpfTwvc3Bhbj5cbiAgPC9kaXY+XG4gIFwiXCJcIlxuXG5cblxuICBcbnJlbmRlcl9maWVsZHMgPSggZmllbGRzLCBkYXRhKSAtPlxuICAoIHJlbmRlcl9maWVsZChmLCBkYXRhKSBmb3IgZiBpbiBmaWVsZHMpLmpvaW4oJycpXG5cblxuXG5cbiAgXG51bmRlciA9IChzKSAtPiBzLnJlcGxhY2UoLyAvZywgJ18nKVxuXG5cbnJlbmRlcl90YWJzID0gKGluaXRpYWxfbGF5b3V0LCBkYXRhKSAtPlxuICBsYXlvdXQgPSBhZGRfb3RoZXJfdGFiX3RvX2xheW91dCBpbml0aWFsX2xheW91dCwgZGF0YVxuICAjcmVuZGVyIGhlYWRlclxuICBoID0gJzxkaXYgcm9sZT1cInRhYnBhbmVsXCIgPidcblxuICAjcmVuZGVyIHRhYnNcbiAgaCArPSc8dWwgaWQ9XCJmaWVsZFRhYnNcIiBjbGFzcz1cIm5hdiBuYXYtdGFic1wiIHJvbGU9XCJ0YWJsaXN0XCI+J1xuICBcbiAgZm9yIHRhYixpIGluIGxheW91dFxuICAgIGFjdGl2ZSA9IGlmIGk+MCB0aGVuICcnIGVsc2UgJ2FjdGl2ZSdcbiAgICBoICs9XCJcIlwiXG4gICAgICA8bGkgcm9sZT1cInByZXNlbnRhdGlvblwiIGNsYXNzPVwiI3thY3RpdmV9XCIgb25jbGljaz1cInJlbWVtYmVyX3RhYignI3t1bmRlcih0YWIubmFtZSl9JylcIj5cbiAgICAgICAgPGEgaHJlZj1cIiMje3VuZGVyKHRhYi5uYW1lKX1cIiBhcmlhLWNvbnRyb2xzPVwiaG9tZVwiIHJvbGU9XCJ0YWJcIiBkYXRhLXRvZ2dsZT1cInRhYlwiPlxuICAgICAgICAje3RhYi5uYW1lfVxuICAgICAgICA8L2E+XG4gICAgICA8L2xpPlxuICAgIFwiXCJcIlxuXG4gIGggKz0gJzwvdWw+J1xuICBoICs9ICc8ZGl2IGNsYXNzPVwidGFiLWNvbnRlbnRcIj4nXG5cbiAgI3JlbmRlciB0YWJzIGNvbnRlbnRcbiAgZm9yIHRhYixpIGluIGxheW91dFxuICAgIGFjdGl2ZSA9IGlmIGk+MCB0aGVuICcnIGVsc2UgJ2FjdGl2ZSdcbiAgICBoICs9XCJcIlwiXG4gICAgPGRpdiByb2xlPVwidGFicGFuZWxcIiBjbGFzcz1cInRhYi1wYW5lICN7YWN0aXZlfVwiIGlkPVwiI3t1bmRlcih0YWIubmFtZSl9XCIgc3R5bGU9XCJwYWRkaW5nLXRvcDogNDBweDtcIj5cbiAgICAgICAgI3tyZW5kZXJfZmllbGRzIHRhYi5maWVsZHMsIGRhdGF9XG4gICAgPC9kaXY+XG4gICAgXCJcIlwiXG4gIFxuICAjcmVuZGVyIGZvb3RlclxuICBoICs9JzwvZGl2PidcbiAgaCArPSc8L2Rpdj4nXG4gIHJldHVybiBoXG5cblxuZ2V0X2xheW91dF9maWVsZHMgPSAobGEpIC0+XG4gIGYgPSB7fVxuICBmb3IgdCBpbiBsYVxuICAgIGZvciBmaWVsZCBpbiB0LmZpZWxkc1xuICAgICAgZltmaWVsZF0gPSAxXG4gIHJldHVybiBmXG5cbmdldF9yZWNvcmRfZmllbGRzID0gKHIpIC0+XG4gIGYgPSB7fVxuICBmb3IgZmllbGRfbmFtZSBvZiByXG4gICAgZltmaWVsZF9uYW1lXSA9IDFcbiAgcmV0dXJuIGZcblxuZ2V0X3VubWVudGlvbmVkX2ZpZWxkcyA9IChsYSwgcikgLT5cbiAgbGF5b3V0X2ZpZWxkcyA9IGdldF9sYXlvdXRfZmllbGRzIGxhXG4gIHJlY29yZF9maWVsZHMgPSBnZXRfcmVjb3JkX2ZpZWxkcyByXG4gIHVubWVudGlvbmVkX2ZpZWxkcyA9IFtdXG4gIFxuICAjZm9yIGYgb2YgcmVjb3JkX2ZpZWxkc1xuICAjICBpZiBub3QgbGF5b3V0X2ZpZWxkc1tmXVxuICAjICAgIHVubWVudGlvbmVkX2ZpZWxkcy5wdXNoIGZcbiAgXG4gIHVubWVudGlvbmVkX2ZpZWxkcy5wdXNoKGYpIGZvciBmIG9mIHJlY29yZF9maWVsZHMgd2hlbiBub3QgbGF5b3V0X2ZpZWxkc1tmXVxuXG4gIHJldHVybiB1bm1lbnRpb25lZF9maWVsZHNcblxuXG5hZGRfb3RoZXJfdGFiX3RvX2xheW91dCA9IChsYXlvdXQ9W10sIGRhdGEpIC0+XG4gICNjbG9uZSB0aGUgbGF5b3V0XG4gIGwgPSAkLmV4dGVuZCB0cnVlLCBbXSwgbGF5b3V0XG4gIHQgPVxuICAgIG5hbWU6IFwiT3RoZXJcIlxuICAgIGZpZWxkczogZ2V0X3VubWVudGlvbmVkX2ZpZWxkcyBsLCBkYXRhXG5cbiAgbC5wdXNoIHRcbiAgcmV0dXJuIGxcblxuXG5cblxuY2xhc3MgVGVtcGxhdGVzMlxuXG4gIEBsaXN0ID0gdW5kZWZpbmVkXG5cbiAgY29uc3RydWN0b3I6KCkgLT5cbiAgICBAbGlzdCA9IFtdXG5cbiAgYWRkX3RlbXBsYXRlOiAobGF5b3V0X25hbWUsIGxheW91dF9qc29uKSAtPlxuICAgIEBsaXN0LnB1c2hcbiAgICAgIG5hbWU6bGF5b3V0X25hbWVcbiAgICAgIHJlbmRlcjooZGF0KSAtPlxuICAgICAgICByZW5kZXJfdGFicyhsYXlvdXRfanNvbiwgZGF0KVxuXG5cbiAgbG9hZF90ZW1wbGF0ZToodGVtcGxhdGVfbmFtZSwgdXJsKSAtPlxuICAgICQuYWpheFxuICAgICAgdXJsOiB1cmxcbiAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgIGNhY2hlOiB0cnVlXG4gICAgICBzdWNjZXNzOiAodGVtcGxhdGVfanNvbikgPT5cbiAgICAgICAgQGFkZF90ZW1wbGF0ZSh0ZW1wbGF0ZV9uYW1lLCB0ZW1wbGF0ZV9qc29uKVxuICAgICAgICByZXR1cm5cblxuXG4gIGdldF9uYW1lczogLT5cbiAgICAodC5uYW1lIGZvciB0IGluIEBsaXN0KVxuXG4gIGdldF9pbmRleF9ieV9uYW1lOiAobmFtZSkgLT5cbiAgICBmb3IgdCxpIGluIEBsaXN0XG4gICAgICBpZiB0Lm5hbWUgaXMgbmFtZVxuICAgICAgICByZXR1cm4gaVxuICAgICByZXR1cm4gLTFcblxuICBnZXRfaHRtbDogKGluZCwgZGF0YSkgLT5cbiAgICBpZiAoaW5kIGlzIC0xKSB0aGVuIHJldHVybiAgXCJcIlxuICAgIFxuICAgIGlmIEBsaXN0W2luZF1cbiAgICAgIHJldHVybiBAbGlzdFtpbmRdLnJlbmRlcihkYXRhKVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBcIlwiXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFRlbXBsYXRlczJcbiJdfQ==
