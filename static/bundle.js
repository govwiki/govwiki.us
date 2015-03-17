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
      if (test_string(d.gov_name + " " + d.state + " " + d.gov_type + " " + d.inc_id, regs)) {
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
    d.state = strongify(d.state, words, regs);
    d.gov_type = strongify(d.gov_type, words, regs);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvdmFkaW1pdmxldi9Qcm9qZWN0cy9fcHJvamVjdHMvZ292d2lraS51cy9jb2ZmZWUvZ292bWFwLmNvZmZlZSIsIi9Vc2Vycy92YWRpbWl2bGV2L1Byb2plY3RzL19wcm9qZWN0cy9nb3Z3aWtpLnVzL2NvZmZlZS9nb3ZzZWxlY3Rvci5jb2ZmZWUiLCIvVXNlcnMvdmFkaW1pdmxldi9Qcm9qZWN0cy9fcHJvamVjdHMvZ292d2lraS51cy9jb2ZmZWUvanF1ZXJ5LmdvdnNlbGVjdG9yLmNvZmZlZSIsIi9Vc2Vycy92YWRpbWl2bGV2L1Byb2plY3RzL19wcm9qZWN0cy9nb3Z3aWtpLnVzL2NvZmZlZS9tYWluLmNvZmZlZSIsIi9Vc2Vycy92YWRpbWl2bGV2L1Byb2plY3RzL19wcm9qZWN0cy9nb3Z3aWtpLnVzL2NvZmZlZS9xdWVyeW1hdGNoZXIuY29mZmVlIiwiL1VzZXJzL3ZhZGltaXZsZXYvUHJvamVjdHMvX3Byb2plY3RzL2dvdndpa2kudXMvY29mZmVlL3RlbXBsYXRlczIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSwyQ0FBQTs7QUFBQSxRQUFBLEdBQWUsSUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQWIsQ0FDYiwrRUFEYSxFQUVULElBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFiLENBQW1CLEVBQW5CLEVBQXVCLEVBQXZCLENBRlMsRUFHVCxJQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBYixDQUFvQixDQUFwQixFQUF1QixDQUF2QixDQUhTLEVBSVQsSUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQWIsQ0FBb0IsRUFBcEIsRUFBd0IsRUFBeEIsQ0FKUyxDQUFmLENBQUE7O0FBQUEs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QkEsUUFBQSxHQUFVLFNBQUMsR0FBRCxFQUFNLElBQU4sR0FBQTtBQUNSLElBQUEsSUFBSSxHQUFBLEtBQU8sQ0FBQSxDQUFYO0FBQW9CLGFBQVEsRUFBUixDQUFwQjtLQUFBO0FBRUEsSUFBQSxJQUFHLElBQUMsQ0FBQSxJQUFLLENBQUEsR0FBQSxDQUFUO0FBQ0UsYUFBTyxJQUFDLENBQUEsSUFBSyxDQUFBLEdBQUEsQ0FBSSxDQUFDLE1BQVgsQ0FBa0IsSUFBbEIsQ0FBUCxDQURGO0tBQUEsTUFBQTtBQUdFLGFBQU8sRUFBUCxDQUhGO0tBSFE7RUFBQSxDQS9CVixDQUFBOztvQkFBQTs7SUFwSkYsQ0FBQTs7QUFBQSxNQTZMTSxDQUFDLE9BQVAsR0FBaUIsVUE3TGpCLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwicGluSW1hZ2UgPSBuZXcgKGdvb2dsZS5tYXBzLk1hcmtlckltYWdlKShcbiAgJ2h0dHA6Ly9jaGFydC5hcGlzLmdvb2dsZS5jb20vY2hhcnQ/Y2hzdD1kX21hcF9waW5fbGV0dGVyJmNobGQ9Wnw3Nzc3QkJ8RkZGRkZGJyAsXG4gIG5ldyAoZ29vZ2xlLm1hcHMuU2l6ZSkoMjEsIDM0KSxcbiAgbmV3IChnb29nbGUubWFwcy5Qb2ludCkoMCwgMCksXG4gIG5ldyAoZ29vZ2xlLm1hcHMuUG9pbnQpKDEwLCAzNClcbiAgKVxuXG5cbm1hcCA9IG5ldyBHTWFwc1xuICBlbDogJyNnb3ZtYXAnXG4gIGxhdDogLTEyLjA0MzMzM1xuICBsbmc6IC03Ny4wMjgzMzNcbiAgem9vbToxNFxuXG5nZW9jb2RlX2FkZHIgPSAoYWRkcixkYXRhKSAtPlxuICBHTWFwcy5nZW9jb2RlXG4gICAgYWRkcmVzczogYWRkclxuICAgIGNhbGxiYWNrOiAocmVzdWx0cywgc3RhdHVzKSAtPlxuICAgICAgaWYgc3RhdHVzID09ICdPSydcbiAgICAgICAgbGF0bG5nID0gcmVzdWx0c1swXS5nZW9tZXRyeS5sb2NhdGlvblxuICAgICAgICBtYXAuc2V0Q2VudGVyIGxhdGxuZy5sYXQoKSwgbGF0bG5nLmxuZygpXG4gICAgICAgIG1hcC5hZGRNYXJrZXJcbiAgICAgICAgICBsYXQ6IGxhdGxuZy5sYXQoKVxuICAgICAgICAgIGxuZzogbGF0bG5nLmxuZygpXG4gICAgICAgICAgc2l6ZTogJ3NtYWxsJ1xuICAgICAgICAgIHRpdGxlOiByZXN1bHRzWzBdLmZvcm1hdHRlZF9hZGRyZXNzXG4gICAgICAgICAgaW5mb1dpbmRvdzpcbiAgICAgICAgICAgIGNvbnRlbnQ6IHJlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3NcbiAgICAgICAgXG4gICAgICAgIGlmIGRhdGFcbiAgICAgICAgICBtYXAuYWRkTWFya2VyXG4gICAgICAgICAgICBsYXQ6IGRhdGEubGF0aXR1ZGVcbiAgICAgICAgICAgIGxuZzogZGF0YS5sb25naXR1ZGVcbiAgICAgICAgICAgIHNpemU6ICdzbWFsbCdcbiAgICAgICAgICAgIGNvbG9yOiAnYmx1ZSdcbiAgICAgICAgICAgIGljb246IHBpbkltYWdlXG4gICAgICAgICAgICB0aXRsZTogIFwiI3tkYXRhLmxhdGl0dWRlfSAje2RhdGEubG9uZ2l0dWRlfVwiXG4gICAgICAgICAgICBpbmZvV2luZG93OlxuICAgICAgICAgICAgICBjb250ZW50OiBcIiN7ZGF0YS5sYXRpdHVkZX0gI3tkYXRhLmxvbmdpdHVkZX1cIlxuICAgICAgICAgICAgXG4gICAgICAgICQoJy5nb3ZtYXAtZm91bmQnKS5odG1sIFwiPHN0cm9uZz5GT1VORDogPC9zdHJvbmc+I3tyZXN1bHRzWzBdLmZvcm1hdHRlZF9hZGRyZXNzfVwiXG4gICAgICByZXR1cm5cblxuY2xlYXI9KHMpLT5cbiAgcmV0dXJuIGlmIHMubWF0Y2goLyBib3ggL2kpIHRoZW4gJycgZWxzZSBzXG5cblxuXG5nZW9jb2RlID0gKGRhdGEpIC0+XG4gIGFkZHIgPSBcIiN7Y2xlYXIoZGF0YS5hZGRyZXNzMSl9ICN7Y2xlYXIoZGF0YS5hZGRyZXNzMil9LCAje2RhdGEuY2l0eX0sICN7ZGF0YS5zdGF0ZX0gI3tkYXRhLnppcH0sIFVTQVwiXG4gICQoJyNnb3ZhZGRyZXNzJykudmFsKGFkZHIpXG4gIGdlb2NvZGVfYWRkciBhZGRyLCBkYXRhXG5cblwiMSBEb2N0b3IgQ2FybHRvbiBCIEdvb2RsZXR0IFBsYWNlLCBTYW4gRnJhbmNpc2NvLCBDQSA5NDEwMiwgVVNBXCJcblxubW9kdWxlLmV4cG9ydHMgPVxuICBnZW9jb2RlOiBnZW9jb2RlXG4gIGdvY29kZV9hZGRyOiBnZW9jb2RlX2FkZHJcblxuIiwicXVlcnlfbWF0Y2hlciA9IHJlcXVpcmUoJy4vcXVlcnltYXRjaGVyLmNvZmZlZScpXG5cbmNsYXNzIEdvdlNlbGVjdG9yXG4gIFxuICAjIHN0dWIgb2YgYSBjYWxsYmFjayB0byBlbnZva2Ugd2hlbiB0aGUgdXNlciBzZWxlY3RzIHNvbWV0aGluZ1xuICBvbl9zZWxlY3RlZDogKGV2dCwgZGF0YSwgbmFtZSkgLT5cblxuXG4gIGNvbnN0cnVjdG9yOiAoQGh0bWxfc2VsZWN0b3IsIGRvY3NfdXJsLCBAbnVtX2l0ZW1zKSAtPlxuICAgICQuYWpheFxuICAgICAgdXJsOiBkb2NzX3VybFxuICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgY2FjaGU6IHRydWVcbiAgICAgIHN1Y2Nlc3M6IEBzdGFydFN1Z2dlc3Rpb25cbiAgICAgIFxuXG5cblxuICBzdWdnZXN0aW9uVGVtcGxhdGUgOiBIYW5kbGViYXJzLmNvbXBpbGUoXCJcIlwiXG4gICAgPGRpdiBjbGFzcz1cInN1Z2ctYm94XCI+XG4gICAgPHA+PHNwYW4gY2xhc3M9XCJzdWdnLW1haW5cIj57e3tnb3ZfbmFtZX19fTwvc3Bhbj4gXG4gICAgPHNwYW4gY2xhc3M9XCJzdWdnLXNtYWxsXCI+e3t7c3RhdGV9fX0gJm5ic3A7e3t7Z292X3R5cGV9fX08L3NwYW4+XG4gICAgPC9wPlxuICAgIDwvZGl2PlwiXCJcIilcblxuICBlbnRlcmVkX3ZhbHVlOlwiXCJcblxuICBzdGFydFN1Z2dlc3Rpb24gOiAoZ292cykgPT5cbiAgICBcbiAgICAkKCcudHlwZWFoZWFkJykua2V5dXAgKGV2ZW50KSA9PlxuICAgICAgQGVudGVyZWRfdmFsdWUgPSAkKGV2ZW50LnRhcmdldCkudmFsKClcbiAgICBcbiAgICAkKEBodG1sX3NlbGVjdG9yKS5hdHRyICdwbGFjZWhvbGRlcicsICdHT1ZFUk5NRU5UIE5BTUUnXG4gICAgJChAaHRtbF9zZWxlY3RvcikudHlwZWFoZWFkKFxuICAgICAgICBoaW50OiBmYWxzZVxuICAgICAgICBoaWdobGlnaHQ6IGZhbHNlXG4gICAgICAgIG1pbkxlbmd0aDogMVxuICAgICAgLFxuICAgICAgICBuYW1lOiAnZ292X25hbWUnXG4gICAgICAgIGRpc3BsYXlLZXk6ICdnb3ZfbmFtZSdcbiAgICAgICAgc291cmNlOiBxdWVyeV9tYXRjaGVyKGdvdnMsIEBudW1faXRlbXMpXG4gICAgICAgICNzb3VyY2U6IGJsb29kaG91bmQudHRBZGFwdGVyKClcbiAgICAgICAgdGVtcGxhdGVzOiBzdWdnZXN0aW9uOiBAc3VnZ2VzdGlvblRlbXBsYXRlXG4gICAgKVxuICAgIC5vbiAndHlwZWFoZWFkOnNlbGVjdGVkJywgIChldnQsIGRhdGEsIG5hbWUpID0+XG4gICAgICAgICQoJy50eXBlYWhlYWQnKS50eXBlYWhlYWQgJ3ZhbCcsIEBlbnRlcmVkX3ZhbHVlXG4gICAgICAgIEBvbl9zZWxlY3RlZChldnQsIGRhdGEsIG5hbWUpXG4gICBcbiAgICAub24gJ3R5cGVhaGVhZDpjdXJzb3JjaGFuZ2VkJywgKGV2dCwgZGF0YSwgbmFtZSkgPT5cbiAgICAgICAgJCgnLnR5cGVhaGVhZCcpLnZhbCBAZW50ZXJlZF92YWx1ZVxuICAgIFxuXG4gICAgcmV0dXJuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHM9R292U2VsZWN0b3JcblxuXG4iLCIoKCQpIC0+XG5cbiAgJC5nb3ZzZWxlY3RvciA9IChlbCwgb3B0aW9ucykgLT5cblxuICAgICMgVG8gYXZvaWQgc2NvcGUgaXNzdWVzLCB1c2UgJ2Jhc2UnIGluc3RlYWQgb2YgJ3RoaXMnXG4gICAgIyB0byByZWZlcmVuY2UgdGhpcyBjbGFzcyBmcm9tIGludGVybmFsIGV2ZW50cyBhbmQgZnVuY3Rpb25zLlxuICAgIGJhc2UgPSB0aGlzXG4gICAgXG4gICAgXG4gICAgIyBBY2Nlc3MgdG8galF1ZXJ5IGFuZCBET00gdmVyc2lvbnMgb2YgZWxlbWVudFxuICAgIGJhc2UuJGVsID0gJChlbClcbiAgICBiYXNlLmVsID0gZWxcbiAgICBcbiAgICBcbiAgICAjIEFkZCBhIHJldmVyc2UgcmVmZXJlbmNlIHRvIHRoZSBET00gb2JqZWN0XG4gICAgYmFzZS4kZWwuZGF0YSAnZ292c2VsZWN0b3InLCBiYXNlXG5cbiAgICAjIGRlbGF5IHVzYWdlXG4gICAgIyQoJ2lucHV0Jykua2V5dXAgLT5cbiAgICAjICBkZWxheSAoLT4gYWxlcnQgJ1RpbWUgZWxhcHNlZCEnOyByZXR1cm4pLCAxMDAwXG4gICAgIyAgcmV0dXJuXG4gICAgICBcbiAgICBkZWxheSA9IGRvIC0+XG4gICAgICB0aW1lciA9IDBcbiAgICAgIChjYWxsYmFjaywgbXMpIC0+XG4gICAgICAgIGNsZWFyVGltZW91dCB0aW1lclxuICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoY2FsbGJhY2ssIG1zKVxuICAgICAgICByZXR1cm5cbiAgICBcbiAgICBvbmtleXVwID0gKGV2ZW50KSAtPlxuICAgICAgc3dpdGNoICBldmVudC53aGljaFxuICAgICAgICAjIEVudGVyXG4gICAgICAgIHdoZW4gMTNcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgJCgnLnR5cGVhaGVhZCcpLnR5cGVhaGVhZCAndmFsJywgYmFzZS4kZWwudmFsKClcbiAgICAgICAgICAkKCcudHlwZWFoZWFkJykudHlwZWFoZWFkICdvcGVuJ1xuICAgICAgICAjIEVzY1xuICAgICAgICB3aGVuIDI3XG4gICAgICAgICAgJCgnLnR5cGVhaGVhZCcpLnR5cGVhaGVhZCAnY2xvc2UnXG4gICAgICAgICMgVXBcbiAgICAgICAgd2hlbiAzOCB0aGVuXG4gICAgICAgICMgRG93blxuICAgICAgICB3aGVuIDQwIHRoZW5cbiAgICAgICAgZWxzZVxuICAgICAgICAgICQoJy50eXBlYWhlYWQnKS50eXBlYWhlYWQgJ3ZhbCcsIGJhc2UuJGVsLnZhbCgpXG4gICAgICAgICAgJCgnLnR5cGVhaGVhZCcpLnR5cGVhaGVhZCAnb3BlbidcbiAgICAgICNldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBjb25zb2xlLmxvZyBldmVudC53aGljaFxuICAgICAgcmV0dXJuXG5cbiAgICBibHVyID0gKGV2ZW50KSAtPlxuICAgICAgY29uc29sZS5sb2cgJ2JsdXInXG4gICAgXG4gICAgYmFzZS5pbml0ID0gLT5cbiAgICAgIGJhc2Uub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCAkLmdvdnNlbGVjdG9yLmRlZmF1bHRPcHRpb25zLCBvcHRpb25zKVxuICAgICAgIyBQdXQgeW91ciBpbml0aWFsaXphdGlvbiBjb2RlIGhlcmVcbiAgICAgIGJhc2UuJGVsLmNzcyAnYmFja2dyb3VuZC1jb2xvcicsICd3aGl0ZSdcbiAgICAgIGJhc2UuJGVsLmtleXVwIG9ua2V5dXBcbiAgICAgIGJhc2UuJGVsLmJsdXIgb25ibHVyXG5cbiAgICAgIHJldHVyblxuXG4gICAgXG4gICAgIyBTYW1wbGUgRnVuY3Rpb24sIFVuY29tbWVudCB0byB1c2VcbiAgICAjIGJhc2UuZnVuY3Rpb25OYW1lID0gZnVuY3Rpb24ocGFyYW1hdGVycyl7XG4gICAgI1xuICAgICMgfTtcbiAgICBcbiAgICBcbiAgICAjIFJ1biBpbml0aWFsaXplclxuICAgIGJhc2UuaW5pdCgpXG4gICAgcmV0dXJuXG5cbiAgICBcbiAgJC5nb3ZzZWxlY3Rvci5kZWZhdWx0T3B0aW9ucyA9XG4gICAgcm93czogNVxuICAgIHRlbXBsYXRlOiAne3t9fSdcblxuICAgIFxuICAkLmZuLmdvdnNlbGVjdG9yID0gKG9wdGlvbnMpIC0+XG4gICAgQGVhY2ggLT5cbiAgICAgIG5ldyAoJC5nb3ZzZWxlY3RvcikodGhpcywgb3B0aW9ucylcbiAgICAgIHJldHVyblxuXG4gICAgXG4gICMgVGhpcyBmdW5jdGlvbiBicmVha3MgdGhlIGNoYWluLCBidXQgcmV0dXJuc1xuICAjIHRoZSBnb3ZzZWxlY3RvciBpZiBpdCBoYXMgYmVlbiBhdHRhY2hlZCB0byB0aGUgb2JqZWN0LlxuICAkLmZuLmdldGdvdnNlbGVjdG9yID0gLT5cbiAgICBAZGF0YSAnZ292c2VsZWN0b3InXG4gICAgcmV0dXJuXG5cbiAgICBcbiAgcmV0dXJuXG4pIGpRdWVyeVxuIiwiIyMjXG5maWxlOiBtYWluLmNvZmZlIC0tIFRoZSBlbnRyeSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICA6XG5nb3ZfZmluZGVyID0gbmV3IEdvdkZpbmRlclxuZ292X2RldGFpbHMgPSBuZXcgR292RGV0YWlsc1xuZ292X2ZpbmRlci5vbl9zZWxlY3QgPSBnb3ZfZGV0YWlscy5zaG93XG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyMjXG5cbkdvdlNlbGVjdG9yID0gcmVxdWlyZSAnLi9nb3ZzZWxlY3Rvci5jb2ZmZWUnXG5fanFncyAgICAgICA9IHJlcXVpcmUgJy4vanF1ZXJ5LmdvdnNlbGVjdG9yLmNvZmZlZSdcblRlbXBsYXRlczIgICAgICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzMi5jb2ZmZWUnXG5nb3ZtYXAgICAgICA9IHJlcXVpcmUgJy4vZ292bWFwLmNvZmZlZSdcblxuXG5cbmdvdl9zZWxlY3RvciA9IG5ldyBHb3ZTZWxlY3RvciAnLnR5cGVhaGVhZCcsICdkYXRhL2hfdHlwZXMuanNvbicsIDdcbnRlbXBsYXRlcyA9IG5ldyBUZW1wbGF0ZXMyXG5hY3RpdmVfdGFiPVwiXCJcblxud2luZG93LnJlbWVtYmVyX3RhYiA9KG5hbWUpLT4gYWN0aXZlX3RhYiA9IG5hbWVcblxud2luZG93Lmdlb2NvZGVfYWRkciA9IChpbnB1dF9zZWxlY3RvciktPiBnb3ZtYXAuZ29jb2RlX2FkZHIgJChpbnB1dF9zZWxlY3RvcikudmFsKClcblxuYWN0aXZhdGVfdGFiID0oKSAtPlxuICAkKFwiI2ZpZWxkVGFicyBhW2hyZWY9JyMje2FjdGl2ZV90YWJ9J11cIikudGFiKCdzaG93JylcblxuXG5nb3Zfc2VsZWN0b3Iub25fc2VsZWN0ZWQgPSAoZXZ0LCBkYXRhLCBuYW1lKSAtPlxuICAjcmVuZGVyRGF0YSAnI2RldGFpbHMnLCBkYXRhXG4gICQoJyNkZXRhaWxzJykuaHRtbCB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgZGF0YSlcbiAgYWN0aXZhdGVfdGFiKClcbiAgZ2V0X3JlY29yZCBcImluY19pZDoje2RhdGFbXCJpbmNfaWRcIl19XCJcbiAgcmV0dXJuXG5cblxuZ2V0X3JlY29yZCA9IChxdWVyeSkgLT5cbiAgJC5hamF4XG4gICAgdXJsOiBcImh0dHBzOi8vYXBpLm1vbmdvbGFiLmNvbS9hcGkvMS9kYXRhYmFzZXMvZ292d2lraS9jb2xsZWN0aW9ucy9nb3ZzLz9xPXsje3F1ZXJ5fX0mZj17X2lkOjB9Jmw9MSZhcGlLZXk9MFk1WF9RazJ1T0pSZEhKV0pLU1JXazZsNkpxVlRTMnlcIlxuICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICBjYWNoZTogdHJ1ZVxuICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgI2lmIGRhdGEubGVuZ3RoIHRoZW4gcmVuZGVyRGF0YSAnI2RldGFpbHMnLCAgZGF0YVswXVxuICAgICAgaWYgZGF0YS5sZW5ndGhcbiAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sIHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBkYXRhWzBdKVxuICAgICAgICBhY3RpdmF0ZV90YWIoKVxuICAgICAgICAkKCcjbWFwYXJlYScpLmNzcygndmlzaWJpbGl0eScsJ3Zpc2libGUnKVxuICAgICAgICBnb3ZtYXAuZ2VvY29kZSBkYXRhWzBdXG4gICAgICByZXR1cm5cblxuXG5cblxuXG4kKCcjbWFwYXJlYScpLmNzcygndmlzaWJpbGl0eScsJ2hpZGRlbicpXG5cblxudGVtcGxhdGVzLmxvYWRfdGVtcGxhdGUgXCJ0YWJzXCIsIFwiY29uZmlnL3RhYmxheW91dC5qc29uXCJcbiIsIlxuXG5cbiMgVGFrZXMgYW4gYXJyYXkgb2YgZG9jcyB0byBzZWFyY2ggaW4uXG4jIFJldHVybnMgYSBmdW5jdGlvbnMgdGhhdCB0YWtlcyAyIHBhcmFtcyBcbiMgcSAtIHF1ZXJ5IHN0cmluZyBhbmQgXG4jIGNiIC0gY2FsbGJhY2sgdGhhdCB3aWxsIGJlIGNhbGxlZCB3aGVuIHRoZSBzZWFyY2ggaXMgZG9uZS5cbiMgY2IgcmV0dXJucyBhbiBhcnJheSBvZiBtYXRjaGluZyBkb2N1bWVudHMuXG4jIG11bV9pdGVtcyAtIG1heCBudW1iZXIgb2YgZm91bmQgaXRlbXMgdG8gc2hvd1xuUXVlcnlNYXRoZXIgPSAoZG9jcywgbnVtX2l0ZW1zPTUpIC0+XG4gIChxLCBjYikgLT5cbiAgICB0ZXN0X3N0cmluZyA9KHMsIHJlZ3MpIC0+XG4gICAgICAoaWYgbm90IHIudGVzdChzKSB0aGVuIHJldHVybiBmYWxzZSkgIGZvciByIGluIHJlZ3NcbiAgICAgIHJldHVybiB0cnVlXG5cbiAgICBbd29yZHMscmVnc10gPSBnZXRfd29yZHNfcmVncyBxXG4gICAgbWF0Y2hlcyA9IFtdXG4gICAgIyBpdGVyYXRlIHRocm91Z2ggdGhlIHBvb2wgb2YgZG9jcyBhbmQgZm9yIGFueSBzdHJpbmcgdGhhdFxuICAgICMgY29udGFpbnMgdGhlIHN1YnN0cmluZyBgcWAsIGFkZCBpdCB0byB0aGUgYG1hdGNoZXNgIGFycmF5XG5cbiAgICBmb3IgZCBpbiBkb2NzXG4gICAgICBpZiBtYXRjaGVzLmxlbmd0aCA+PSBudW1faXRlbXMgdGhlbiBicmVha1xuICAgICAgaWYgdGVzdF9zdHJpbmcoXCIje2QuZ292X25hbWV9ICN7ZC5zdGF0ZX0gI3tkLmdvdl90eXBlfSAje2QuaW5jX2lkfVwiLCByZWdzKSB0aGVuIG1hdGNoZXMucHVzaCAkLmV4dGVuZCh7fSwgZClcbiAgICBcbiAgICBzZWxlY3RfdGV4dCBtYXRjaGVzLCB3b3JkcywgcmVnc1xuICAgIGNiIG1hdGNoZXNcbiAgICByZXR1cm5cbiBcblxuIyBpbnNlcnRzIDxzdHJvbmc+IGVsZW1lbnRzZSBpbiBhcnJheVxuc2VsZWN0X3RleHQgPSAoY2xvbmVzLHdvcmRzLHJlZ3MpIC0+XG4gIGZvciBkIGluIGNsb25lc1xuICAgIGQuZ292X25hbWU9c3Ryb25naWZ5KGQuZ292X25hbWUsIHdvcmRzLCByZWdzKVxuICAgIGQuc3RhdGU9c3Ryb25naWZ5KGQuc3RhdGUsIHdvcmRzLCByZWdzKVxuICAgIGQuZ292X3R5cGU9c3Ryb25naWZ5KGQuZ292X3R5cGUsIHdvcmRzLCByZWdzKVxuICBcbiAgcmV0dXJuIGNsb25lc1xuXG5cblxuIyBpbnNlcnRzIDxzdHJvbmc+IGVsZW1lbnRzZVxuc3Ryb25naWZ5ID0gKHMsIHdvcmRzLCByZWdzKSAtPlxuICByZWdzLmZvckVhY2ggKHIsaSkgLT5cbiAgICBzID0gcy5yZXBsYWNlIHIsIFwiPGI+I3t3b3Jkc1tpXX08L2I+XCJcbiAgcmV0dXJuIHNcblxuIyByZW1vdmVzIDw+IHRhZ3MgZnJvbSBhIHN0cmluZ1xuc3RyaXAgPSAocykgLT5cbiAgcy5yZXBsYWNlKC88W148Pl0qPi9nLCcnKVxuXG5cbiMgYWxsIHRpcm1zIHNwYWNlcyBmcm9tIGJvdGggc2lkZXMgYW5kIG1ha2UgY29udHJhY3RzIHNlcXVlbmNlcyBvZiBzcGFjZXMgdG8gMVxuZnVsbF90cmltID0gKHMpIC0+XG4gIHNzPXMudHJpbSgnJytzKVxuICBzcz1zcy5yZXBsYWNlKC8gKy9nLCcgJylcblxuIyByZXR1cm5zIGFuIGFycmF5IG9mIHdvcmRzIGluIGEgc3RyaW5nXG5nZXRfd29yZHMgPSAoc3RyKSAtPlxuICBmdWxsX3RyaW0oc3RyKS5zcGxpdCgnICcpXG5cblxuZ2V0X3dvcmRzX3JlZ3MgPSAoc3RyKSAtPlxuICB3b3JkcyA9IGdldF93b3JkcyBzdHJcbiAgcmVncyA9IHdvcmRzLm1hcCAodyktPiBuZXcgUmVnRXhwKFwiI3t3fVwiLCdpZycpXG4gIFt3b3JkcyxyZWdzXVxuXG5cbm1vZHVsZS5leHBvcnRzID0gUXVlcnlNYXRoZXJcblxuIiwiXG4jIyNcbiMgZmlsZTogdGVtcGxhdGVzMi5jb2ZmZWUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuI1xuIyBDbGFzcyB0byBtYW5hZ2UgdGVtcGxhdGVzIGFuZCByZW5kZXIgZGF0YSBvbiBodG1sIHBhZ2UuXG4jXG4jIFRoZSBtYWluIG1ldGhvZCA6IHJlbmRlcihkYXRhKSwgZ2V0X2h0bWwoZGF0YSlcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIyNcblxuXG5cbiMgTE9BRCBGSUVMRCBOQU1FUyBcbmZpZWxkTmFtZXMgPSB7fVxuXG5sb2FkX2ZpZWxkX25hbWVzID0gKHVybCkgLT5cbiAgJC5hamF4XG4gICAgdXJsOiB1cmxcbiAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgY2FjaGU6IHRydWVcbiAgICBzdWNjZXNzOiAoZmllbGRuYW1lc19qc29uKSA9PlxuICAgICAgZmllbGROYW1lcyA9IGZpZWxkbmFtZXNfanNvblxuICAgICAgcmV0dXJuXG4gICAgZXJyb3I6KGUpLT5cbiAgICAgIGNvbnNvbGUubG9nIGVcblxuXG5sb2FkX2ZpZWxkX25hbWVzKFwiY29uZmlnL2ZpZWxkbmFtZXMuanNvblwiKVxuXG5cblxucmVuZGVyX2ZpZWxkX3ZhbHVlID0obixkYXRhKSAtPlxuICB2PWRhdGFbbl1cbiAgaWYgbiA9PSBcIndlYl9zaXRlXCJcbiAgICByZXR1cm4gXCI8YSB0YXJnZXQ9J19ibGFuaycgaHJlZj0nI3t2fSc+I3t2fTwvYT5cIlxuICBlbHNlXG4gICAgcmV0dXJuIHZcbiAgXG4gIFxuXG5yZW5kZXJfZmllbGRfbmFtZSA9IChmTmFtZSkgLT5cbiAgaWYgZmllbGROYW1lc1tmTmFtZV0/XG4gICAgcmV0dXJuIGZpZWxkTmFtZXNbZk5hbWVdXG5cbiAgcyA9IGZOYW1lLnJlcGxhY2UoL18vZyxcIiBcIilcbiAgcyA9IHMuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzLnN1YnN0cmluZygxKVxuICByZXR1cm4gc1xuXG5cbnJlbmRlcl9maWVsZCA9IChmTmFtZSxkYXRhKS0+XG4gIHJldHVybiAnJyAgdW5sZXNzIGZWYWx1ZSA9IGRhdGFbZk5hbWVdXG4gIFwiXCJcIlxuICA8ZGl2PlxuICAgICAgPHNwYW4gY2xhc3M9J2YtbmFtJz4je3JlbmRlcl9maWVsZF9uYW1lIGZOYW1lfTwvc3Bhbj5cbiAgICAgIDxzcGFuIGNsYXNzPSdmLXZhbCc+I3tyZW5kZXJfZmllbGRfdmFsdWUoZk5hbWUsZGF0YSl9PC9zcGFuPlxuICA8L2Rpdj5cbiAgXCJcIlwiXG5cblxuXG4gIFxucmVuZGVyX2ZpZWxkcyA9KCBmaWVsZHMsIGRhdGEpIC0+XG4gICggcmVuZGVyX2ZpZWxkKGYsIGRhdGEpIGZvciBmIGluIGZpZWxkcykuam9pbignJylcblxuXG5cblxuICBcbnVuZGVyID0gKHMpIC0+IHMucmVwbGFjZSgvIC9nLCAnXycpXG5cblxucmVuZGVyX3RhYnMgPSAoaW5pdGlhbF9sYXlvdXQsIGRhdGEpIC0+XG4gIGxheW91dCA9IGFkZF9vdGhlcl90YWJfdG9fbGF5b3V0IGluaXRpYWxfbGF5b3V0LCBkYXRhXG4gICNyZW5kZXIgaGVhZGVyXG4gIGggPSAnPGRpdiByb2xlPVwidGFicGFuZWxcIiA+J1xuXG4gICNyZW5kZXIgdGFic1xuICBoICs9Jzx1bCBpZD1cImZpZWxkVGFic1wiIGNsYXNzPVwibmF2IG5hdi10YWJzXCIgcm9sZT1cInRhYmxpc3RcIj4nXG4gIFxuICBmb3IgdGFiLGkgaW4gbGF5b3V0XG4gICAgYWN0aXZlID0gaWYgaT4wIHRoZW4gJycgZWxzZSAnYWN0aXZlJ1xuICAgIGggKz1cIlwiXCJcbiAgICAgIDxsaSByb2xlPVwicHJlc2VudGF0aW9uXCIgY2xhc3M9XCIje2FjdGl2ZX1cIiBvbmNsaWNrPVwicmVtZW1iZXJfdGFiKCcje3VuZGVyKHRhYi5uYW1lKX0nKVwiPlxuICAgICAgICA8YSBocmVmPVwiIyN7dW5kZXIodGFiLm5hbWUpfVwiIGFyaWEtY29udHJvbHM9XCJob21lXCIgcm9sZT1cInRhYlwiIGRhdGEtdG9nZ2xlPVwidGFiXCI+XG4gICAgICAgICN7dGFiLm5hbWV9XG4gICAgICAgIDwvYT5cbiAgICAgIDwvbGk+XG4gICAgXCJcIlwiXG5cbiAgaCArPSAnPC91bD4nXG4gIGggKz0gJzxkaXYgY2xhc3M9XCJ0YWItY29udGVudFwiPidcblxuICAjcmVuZGVyIHRhYnMgY29udGVudFxuICBmb3IgdGFiLGkgaW4gbGF5b3V0XG4gICAgYWN0aXZlID0gaWYgaT4wIHRoZW4gJycgZWxzZSAnYWN0aXZlJ1xuICAgIGggKz1cIlwiXCJcbiAgICA8ZGl2IHJvbGU9XCJ0YWJwYW5lbFwiIGNsYXNzPVwidGFiLXBhbmUgI3thY3RpdmV9XCIgaWQ9XCIje3VuZGVyKHRhYi5uYW1lKX1cIiBzdHlsZT1cInBhZGRpbmctdG9wOiA0MHB4O1wiPlxuICAgICAgICAje3JlbmRlcl9maWVsZHMgdGFiLmZpZWxkcywgZGF0YX1cbiAgICA8L2Rpdj5cbiAgICBcIlwiXCJcbiAgXG4gICNyZW5kZXIgZm9vdGVyXG4gIGggKz0nPC9kaXY+J1xuICBoICs9JzwvZGl2PidcbiAgcmV0dXJuIGhcblxuXG5nZXRfbGF5b3V0X2ZpZWxkcyA9IChsYSkgLT5cbiAgZiA9IHt9XG4gIGZvciB0IGluIGxhXG4gICAgZm9yIGZpZWxkIGluIHQuZmllbGRzXG4gICAgICBmW2ZpZWxkXSA9IDFcbiAgcmV0dXJuIGZcblxuZ2V0X3JlY29yZF9maWVsZHMgPSAocikgLT5cbiAgZiA9IHt9XG4gIGZvciBmaWVsZF9uYW1lIG9mIHJcbiAgICBmW2ZpZWxkX25hbWVdID0gMVxuICByZXR1cm4gZlxuXG5nZXRfdW5tZW50aW9uZWRfZmllbGRzID0gKGxhLCByKSAtPlxuICBsYXlvdXRfZmllbGRzID0gZ2V0X2xheW91dF9maWVsZHMgbGFcbiAgcmVjb3JkX2ZpZWxkcyA9IGdldF9yZWNvcmRfZmllbGRzIHJcbiAgdW5tZW50aW9uZWRfZmllbGRzID0gW11cbiAgXG4gICNmb3IgZiBvZiByZWNvcmRfZmllbGRzXG4gICMgIGlmIG5vdCBsYXlvdXRfZmllbGRzW2ZdXG4gICMgICAgdW5tZW50aW9uZWRfZmllbGRzLnB1c2ggZlxuICBcbiAgdW5tZW50aW9uZWRfZmllbGRzLnB1c2goZikgZm9yIGYgb2YgcmVjb3JkX2ZpZWxkcyB3aGVuIG5vdCBsYXlvdXRfZmllbGRzW2ZdXG5cbiAgcmV0dXJuIHVubWVudGlvbmVkX2ZpZWxkc1xuXG5cbmFkZF9vdGhlcl90YWJfdG9fbGF5b3V0ID0gKGxheW91dD1bXSwgZGF0YSkgLT5cbiAgI2Nsb25lIHRoZSBsYXlvdXRcbiAgbCA9ICQuZXh0ZW5kIHRydWUsIFtdLCBsYXlvdXRcbiAgdCA9XG4gICAgbmFtZTogXCJPdGhlclwiXG4gICAgZmllbGRzOiBnZXRfdW5tZW50aW9uZWRfZmllbGRzIGwsIGRhdGFcblxuICBsLnB1c2ggdFxuICByZXR1cm4gbFxuXG5cblxuXG5jbGFzcyBUZW1wbGF0ZXMyXG5cbiAgQGxpc3QgPSB1bmRlZmluZWRcblxuICBjb25zdHJ1Y3RvcjooKSAtPlxuICAgIEBsaXN0ID0gW11cblxuICBhZGRfdGVtcGxhdGU6IChsYXlvdXRfbmFtZSwgbGF5b3V0X2pzb24pIC0+XG4gICAgQGxpc3QucHVzaFxuICAgICAgbmFtZTpsYXlvdXRfbmFtZVxuICAgICAgcmVuZGVyOihkYXQpIC0+XG4gICAgICAgIHJlbmRlcl90YWJzKGxheW91dF9qc29uLCBkYXQpXG5cblxuICBsb2FkX3RlbXBsYXRlOih0ZW1wbGF0ZV9uYW1lLCB1cmwpIC0+XG4gICAgJC5hamF4XG4gICAgICB1cmw6IHVybFxuICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgY2FjaGU6IHRydWVcbiAgICAgIHN1Y2Nlc3M6ICh0ZW1wbGF0ZV9qc29uKSA9PlxuICAgICAgICBAYWRkX3RlbXBsYXRlKHRlbXBsYXRlX25hbWUsIHRlbXBsYXRlX2pzb24pXG4gICAgICAgIHJldHVyblxuXG5cbiAgZ2V0X25hbWVzOiAtPlxuICAgICh0Lm5hbWUgZm9yIHQgaW4gQGxpc3QpXG5cbiAgZ2V0X2luZGV4X2J5X25hbWU6IChuYW1lKSAtPlxuICAgIGZvciB0LGkgaW4gQGxpc3RcbiAgICAgIGlmIHQubmFtZSBpcyBuYW1lXG4gICAgICAgIHJldHVybiBpXG4gICAgIHJldHVybiAtMVxuXG4gIGdldF9odG1sOiAoaW5kLCBkYXRhKSAtPlxuICAgIGlmIChpbmQgaXMgLTEpIHRoZW4gcmV0dXJuICBcIlwiXG4gICAgXG4gICAgaWYgQGxpc3RbaW5kXVxuICAgICAgcmV0dXJuIEBsaXN0W2luZF0ucmVuZGVyKGRhdGEpXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIFwiXCJcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gVGVtcGxhdGVzMlxuIl19
