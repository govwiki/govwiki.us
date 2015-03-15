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

window.geocode_addr = function(input_selector) {
  return govmap.gocode_addr($(input_selector).val());
};

$('#maparea').css('visibility', 'hidden');



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
var Templates2, render_field, render_field_value, render_fields, render_tabs, tab_layout0, under;

tab_layout0 = [
  {
    name: 'General',
    fields: ["gov_name", "census_id", "special_district_function_code", "gov_type", "county_area_name", "county_area_type", "web_site"]
  }, {
    name: 'Address',
    fields: ["census_contact", "address1", "address2", "city", "state", "zip"]
  }, {
    name: 'Stat',
    fields: ["population", "population_as_of_year", "enrollment", "enrollment_as_of_year", "fips_state", "fips_county", "fips_place"]
  }, {
    name: 'Location',
    fields: ["latitude", "longitude"]
  }, {
    name: 'Other',
    fields: ["inc_id"]
  }
];


/*
 * file: templates2.coffee ----------------------------------------------------------------------
#
 * Class to manage templates and render data on html page.
#
 * The main method : render(data), get_html(data)
#-------------------------------------------------------------------------------------------------
 */

render_field_value = function(n, data) {
  var v;
  v = data[n];
  if (n === "web_site") {
    return "<a target='_blank' href='" + v + "'>" + v + "</a>";
  } else {
    return v;
  }
};

render_field = function(fName, data) {
  var fValue;
  if (!(fValue = data[fName])) {
    return '';
  }
  return "<div>\n    <span class='f-nam'>" + fieldNames[fName] + "</span>\n    <span class='f-val'>" + (render_field_value(fName, data)) + "</span>\n</div>";
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

render_tabs = function(layout, data) {
  var active, h, i, j, k, len, len1, tab;
  h = '<div role="tabpanel" style="font-size:150%;">';
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

Templates2 = (function() {
  Templates2.list = void 0;

  function Templates2() {
    this.list = [];
    this.list.push({
      name: "tabs",
      render: function(dat) {
        return render_tabs(tab_layout0, dat);
      }
    });
  }

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
    } else {
      return this.list[ind].render(data);
    }
  };

  return Templates2;

})();

module.exports = Templates2;



},{}]},{},["/Users/vadimivlev/Projects/_projects/govwiki.us/coffee/main.coffee"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvdmFkaW1pdmxldi9Qcm9qZWN0cy9fcHJvamVjdHMvZ292d2lraS51cy9jb2ZmZWUvZ292bWFwLmNvZmZlZSIsIi9Vc2Vycy92YWRpbWl2bGV2L1Byb2plY3RzL19wcm9qZWN0cy9nb3Z3aWtpLnVzL2NvZmZlZS9nb3ZzZWxlY3Rvci5jb2ZmZWUiLCIvVXNlcnMvdmFkaW1pdmxldi9Qcm9qZWN0cy9fcHJvamVjdHMvZ292d2lraS51cy9jb2ZmZWUvanF1ZXJ5LmdvdnNlbGVjdG9yLmNvZmZlZSIsIi9Vc2Vycy92YWRpbWl2bGV2L1Byb2plY3RzL19wcm9qZWN0cy9nb3Z3aWtpLnVzL2NvZmZlZS9tYWluLmNvZmZlZSIsIi9Vc2Vycy92YWRpbWl2bGV2L1Byb2plY3RzL19wcm9qZWN0cy9nb3Z3aWtpLnVzL2NvZmZlZS9xdWVyeW1hdGNoZXIuY29mZmVlIiwiL1VzZXJzL3ZhZGltaXZsZXYvUHJvamVjdHMvX3Byb2plY3RzL2dvdndpa2kudXMvY29mZmVlL3RlbXBsYXRlczIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSwyQ0FBQTs7QUFBQSxRQUFBLEdBQWUsSUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQWIsQ0FDYiwrRUFEYSxFQUVULElBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFiLENBQW1CLEVBQW5CLEVBQXVCLEVBQXZCLENBRlMsRUFHVCxJQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBYixDQUFvQixDQUFwQixFQUF1QixDQUF2QixDQUhTLEVBSVQsSUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQWIsQ0FBb0IsRUFBcEIsRUFBd0IsRUFBeEIsQ0FKUyxDQUFmLENBQUE7O0FBQUEs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dGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwicGluSW1hZ2UgPSBuZXcgKGdvb2dsZS5tYXBzLk1hcmtlckltYWdlKShcbiAgJ2h0dHA6Ly9jaGFydC5hcGlzLmdvb2dsZS5jb20vY2hhcnQ/Y2hzdD1kX21hcF9waW5fbGV0dGVyJmNobGQ9Wnw3Nzc3QkJ8RkZGRkZGJyAsXG4gIG5ldyAoZ29vZ2xlLm1hcHMuU2l6ZSkoMjEsIDM0KSxcbiAgbmV3IChnb29nbGUubWFwcy5Qb2ludCkoMCwgMCksXG4gIG5ldyAoZ29vZ2xlLm1hcHMuUG9pbnQpKDEwLCAzNClcbiAgKVxuXG5cbm1hcCA9IG5ldyBHTWFwc1xuICBlbDogJyNnb3ZtYXAnXG4gIGxhdDogLTEyLjA0MzMzM1xuICBsbmc6IC03Ny4wMjgzMzNcbiAgem9vbToxNFxuXG5nZW9jb2RlX2FkZHIgPSAoYWRkcixkYXRhKSAtPlxuICBHTWFwcy5nZW9jb2RlXG4gICAgYWRkcmVzczogYWRkclxuICAgIGNhbGxiYWNrOiAocmVzdWx0cywgc3RhdHVzKSAtPlxuICAgICAgaWYgc3RhdHVzID09ICdPSydcbiAgICAgICAgbGF0bG5nID0gcmVzdWx0c1swXS5nZW9tZXRyeS5sb2NhdGlvblxuICAgICAgICBtYXAuc2V0Q2VudGVyIGxhdGxuZy5sYXQoKSwgbGF0bG5nLmxuZygpXG4gICAgICAgIG1hcC5hZGRNYXJrZXJcbiAgICAgICAgICBsYXQ6IGxhdGxuZy5sYXQoKVxuICAgICAgICAgIGxuZzogbGF0bG5nLmxuZygpXG4gICAgICAgICAgc2l6ZTogJ3NtYWxsJ1xuICAgICAgICAgIHRpdGxlOiByZXN1bHRzWzBdLmZvcm1hdHRlZF9hZGRyZXNzXG4gICAgICAgICAgaW5mb1dpbmRvdzpcbiAgICAgICAgICAgIGNvbnRlbnQ6IHJlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3NcbiAgICAgICAgXG4gICAgICAgIGlmIGRhdGFcbiAgICAgICAgICBtYXAuYWRkTWFya2VyXG4gICAgICAgICAgICBsYXQ6IGRhdGEubGF0aXR1ZGVcbiAgICAgICAgICAgIGxuZzogZGF0YS5sb25naXR1ZGVcbiAgICAgICAgICAgIHNpemU6ICdzbWFsbCdcbiAgICAgICAgICAgIGNvbG9yOiAnYmx1ZSdcbiAgICAgICAgICAgIGljb246IHBpbkltYWdlXG4gICAgICAgICAgICB0aXRsZTogIFwiI3tkYXRhLmxhdGl0dWRlfSAje2RhdGEubG9uZ2l0dWRlfVwiXG4gICAgICAgICAgICBpbmZvV2luZG93OlxuICAgICAgICAgICAgICBjb250ZW50OiBcIiN7ZGF0YS5sYXRpdHVkZX0gI3tkYXRhLmxvbmdpdHVkZX1cIlxuICAgICAgICAgICAgXG4gICAgICAgICQoJy5nb3ZtYXAtZm91bmQnKS5odG1sIFwiPHN0cm9uZz5GT1VORDogPC9zdHJvbmc+I3tyZXN1bHRzWzBdLmZvcm1hdHRlZF9hZGRyZXNzfVwiXG4gICAgICByZXR1cm5cblxuY2xlYXI9KHMpLT5cbiAgcmV0dXJuIGlmIHMubWF0Y2goLyBib3ggL2kpIHRoZW4gJycgZWxzZSBzXG5cblxuXG5nZW9jb2RlID0gKGRhdGEpIC0+XG4gIGFkZHIgPSBcIiN7Y2xlYXIoZGF0YS5hZGRyZXNzMSl9ICN7Y2xlYXIoZGF0YS5hZGRyZXNzMil9LCAje2RhdGEuY2l0eX0sICN7ZGF0YS5zdGF0ZX0gI3tkYXRhLnppcH0sIFVTQVwiXG4gICQoJyNnb3ZhZGRyZXNzJykudmFsKGFkZHIpXG4gIGdlb2NvZGVfYWRkciBhZGRyLCBkYXRhXG5cblwiMSBEb2N0b3IgQ2FybHRvbiBCIEdvb2RsZXR0IFBsYWNlLCBTYW4gRnJhbmNpc2NvLCBDQSA5NDEwMiwgVVNBXCJcblxubW9kdWxlLmV4cG9ydHMgPVxuICBnZW9jb2RlOiBnZW9jb2RlXG4gIGdvY29kZV9hZGRyOiBnZW9jb2RlX2FkZHJcblxuIiwicXVlcnlfbWF0Y2hlciA9IHJlcXVpcmUoJy4vcXVlcnltYXRjaGVyLmNvZmZlZScpXG5cbmNsYXNzIEdvdlNlbGVjdG9yXG4gIFxuICAjIHN0dWIgb2YgYSBjYWxsYmFjayB0byBlbnZva2Ugd2hlbiB0aGUgdXNlciBzZWxlY3RzIHNvbWV0aGluZ1xuICBvbl9zZWxlY3RlZDogKGV2dCwgZGF0YSwgbmFtZSkgLT5cblxuXG4gIGNvbnN0cnVjdG9yOiAoQGh0bWxfc2VsZWN0b3IsIGRvY3NfdXJsLCBAbnVtX2l0ZW1zKSAtPlxuICAgICQuYWpheFxuICAgICAgdXJsOiBkb2NzX3VybFxuICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgY2FjaGU6IHRydWVcbiAgICAgIHN1Y2Nlc3M6IEBzdGFydFN1Z2dlc3Rpb25cbiAgICAgIFxuXG5cblxuICBzdWdnZXN0aW9uVGVtcGxhdGUgOiBIYW5kbGViYXJzLmNvbXBpbGUoXCJcIlwiXG4gICAgPGRpdiBjbGFzcz1cInN1Z2ctYm94XCI+XG4gICAgPHA+PHNwYW4gY2xhc3M9XCJzdWdnLW1haW5cIj57e3tnb3ZfbmFtZX19fTwvc3Bhbj4gXG4gICAgPHNwYW4gY2xhc3M9XCJzdWdnLXNtYWxsXCI+e3t7c3RhdGV9fX0gJm5ic3A7e3t7Z292X3R5cGV9fX08L3NwYW4+XG4gICAgPC9wPlxuICAgIDwvZGl2PlwiXCJcIilcblxuICBlbnRlcmVkX3ZhbHVlOlwiXCJcblxuICBzdGFydFN1Z2dlc3Rpb24gOiAoZ292cykgPT5cbiAgICBcbiAgICAkKCcudHlwZWFoZWFkJykua2V5dXAgKGV2ZW50KSA9PlxuICAgICAgQGVudGVyZWRfdmFsdWUgPSAkKGV2ZW50LnRhcmdldCkudmFsKClcbiAgICBcbiAgICAkKEBodG1sX3NlbGVjdG9yKS5hdHRyICdwbGFjZWhvbGRlcicsICdHT1ZFUk5NRU5UIE5BTUUnXG4gICAgJChAaHRtbF9zZWxlY3RvcikudHlwZWFoZWFkKFxuICAgICAgICBoaW50OiBmYWxzZVxuICAgICAgICBoaWdobGlnaHQ6IGZhbHNlXG4gICAgICAgIG1pbkxlbmd0aDogMVxuICAgICAgLFxuICAgICAgICBuYW1lOiAnZ292X25hbWUnXG4gICAgICAgIGRpc3BsYXlLZXk6ICdnb3ZfbmFtZSdcbiAgICAgICAgc291cmNlOiBxdWVyeV9tYXRjaGVyKGdvdnMsIEBudW1faXRlbXMpXG4gICAgICAgICNzb3VyY2U6IGJsb29kaG91bmQudHRBZGFwdGVyKClcbiAgICAgICAgdGVtcGxhdGVzOiBzdWdnZXN0aW9uOiBAc3VnZ2VzdGlvblRlbXBsYXRlXG4gICAgKVxuICAgIC5vbiAndHlwZWFoZWFkOnNlbGVjdGVkJywgIChldnQsIGRhdGEsIG5hbWUpID0+XG4gICAgICAgICQoJy50eXBlYWhlYWQnKS50eXBlYWhlYWQgJ3ZhbCcsIEBlbnRlcmVkX3ZhbHVlXG4gICAgICAgIEBvbl9zZWxlY3RlZChldnQsIGRhdGEsIG5hbWUpXG4gICBcbiAgICAub24gJ3R5cGVhaGVhZDpjdXJzb3JjaGFuZ2VkJywgKGV2dCwgZGF0YSwgbmFtZSkgPT5cbiAgICAgICAgJCgnLnR5cGVhaGVhZCcpLnZhbCBAZW50ZXJlZF92YWx1ZVxuICAgIFxuXG4gICAgcmV0dXJuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHM9R292U2VsZWN0b3JcblxuXG4iLCIoKCQpIC0+XG5cbiAgJC5nb3ZzZWxlY3RvciA9IChlbCwgb3B0aW9ucykgLT5cblxuICAgICMgVG8gYXZvaWQgc2NvcGUgaXNzdWVzLCB1c2UgJ2Jhc2UnIGluc3RlYWQgb2YgJ3RoaXMnXG4gICAgIyB0byByZWZlcmVuY2UgdGhpcyBjbGFzcyBmcm9tIGludGVybmFsIGV2ZW50cyBhbmQgZnVuY3Rpb25zLlxuICAgIGJhc2UgPSB0aGlzXG4gICAgXG4gICAgXG4gICAgIyBBY2Nlc3MgdG8galF1ZXJ5IGFuZCBET00gdmVyc2lvbnMgb2YgZWxlbWVudFxuICAgIGJhc2UuJGVsID0gJChlbClcbiAgICBiYXNlLmVsID0gZWxcbiAgICBcbiAgICBcbiAgICAjIEFkZCBhIHJldmVyc2UgcmVmZXJlbmNlIHRvIHRoZSBET00gb2JqZWN0XG4gICAgYmFzZS4kZWwuZGF0YSAnZ292c2VsZWN0b3InLCBiYXNlXG5cbiAgICAjIGRlbGF5IHVzYWdlXG4gICAgIyQoJ2lucHV0Jykua2V5dXAgLT5cbiAgICAjICBkZWxheSAoLT4gYWxlcnQgJ1RpbWUgZWxhcHNlZCEnOyByZXR1cm4pLCAxMDAwXG4gICAgIyAgcmV0dXJuXG4gICAgICBcbiAgICBkZWxheSA9IGRvIC0+XG4gICAgICB0aW1lciA9IDBcbiAgICAgIChjYWxsYmFjaywgbXMpIC0+XG4gICAgICAgIGNsZWFyVGltZW91dCB0aW1lclxuICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoY2FsbGJhY2ssIG1zKVxuICAgICAgICByZXR1cm5cbiAgICBcbiAgICBvbmtleXVwID0gKGV2ZW50KSAtPlxuICAgICAgc3dpdGNoICBldmVudC53aGljaFxuICAgICAgICAjIEVudGVyXG4gICAgICAgIHdoZW4gMTNcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgJCgnLnR5cGVhaGVhZCcpLnR5cGVhaGVhZCAndmFsJywgYmFzZS4kZWwudmFsKClcbiAgICAgICAgICAkKCcudHlwZWFoZWFkJykudHlwZWFoZWFkICdvcGVuJ1xuICAgICAgICAjIEVzY1xuICAgICAgICB3aGVuIDI3XG4gICAgICAgICAgJCgnLnR5cGVhaGVhZCcpLnR5cGVhaGVhZCAnY2xvc2UnXG4gICAgICAgICMgVXBcbiAgICAgICAgd2hlbiAzOCB0aGVuXG4gICAgICAgICMgRG93blxuICAgICAgICB3aGVuIDQwIHRoZW5cbiAgICAgICAgZWxzZVxuICAgICAgICAgICQoJy50eXBlYWhlYWQnKS50eXBlYWhlYWQgJ3ZhbCcsIGJhc2UuJGVsLnZhbCgpXG4gICAgICAgICAgJCgnLnR5cGVhaGVhZCcpLnR5cGVhaGVhZCAnb3BlbidcbiAgICAgICNldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBjb25zb2xlLmxvZyBldmVudC53aGljaFxuICAgICAgcmV0dXJuXG5cbiAgICBibHVyID0gKGV2ZW50KSAtPlxuICAgICAgY29uc29sZS5sb2cgJ2JsdXInXG4gICAgXG4gICAgYmFzZS5pbml0ID0gLT5cbiAgICAgIGJhc2Uub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCAkLmdvdnNlbGVjdG9yLmRlZmF1bHRPcHRpb25zLCBvcHRpb25zKVxuICAgICAgIyBQdXQgeW91ciBpbml0aWFsaXphdGlvbiBjb2RlIGhlcmVcbiAgICAgIGJhc2UuJGVsLmNzcyAnYmFja2dyb3VuZC1jb2xvcicsICd3aGl0ZSdcbiAgICAgIGJhc2UuJGVsLmtleXVwIG9ua2V5dXBcbiAgICAgIGJhc2UuJGVsLmJsdXIgb25ibHVyXG5cbiAgICAgIHJldHVyblxuXG4gICAgXG4gICAgIyBTYW1wbGUgRnVuY3Rpb24sIFVuY29tbWVudCB0byB1c2VcbiAgICAjIGJhc2UuZnVuY3Rpb25OYW1lID0gZnVuY3Rpb24ocGFyYW1hdGVycyl7XG4gICAgI1xuICAgICMgfTtcbiAgICBcbiAgICBcbiAgICAjIFJ1biBpbml0aWFsaXplclxuICAgIGJhc2UuaW5pdCgpXG4gICAgcmV0dXJuXG5cbiAgICBcbiAgJC5nb3ZzZWxlY3Rvci5kZWZhdWx0T3B0aW9ucyA9XG4gICAgcm93czogNVxuICAgIHRlbXBsYXRlOiAne3t9fSdcblxuICAgIFxuICAkLmZuLmdvdnNlbGVjdG9yID0gKG9wdGlvbnMpIC0+XG4gICAgQGVhY2ggLT5cbiAgICAgIG5ldyAoJC5nb3ZzZWxlY3RvcikodGhpcywgb3B0aW9ucylcbiAgICAgIHJldHVyblxuXG4gICAgXG4gICMgVGhpcyBmdW5jdGlvbiBicmVha3MgdGhlIGNoYWluLCBidXQgcmV0dXJuc1xuICAjIHRoZSBnb3ZzZWxlY3RvciBpZiBpdCBoYXMgYmVlbiBhdHRhY2hlZCB0byB0aGUgb2JqZWN0LlxuICAkLmZuLmdldGdvdnNlbGVjdG9yID0gLT5cbiAgICBAZGF0YSAnZ292c2VsZWN0b3InXG4gICAgcmV0dXJuXG5cbiAgICBcbiAgcmV0dXJuXG4pIGpRdWVyeVxuIiwiIyMjXG5maWxlOiBtYWluLmNvZmZlIC0tIFRoZSBlbnRyeSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICA6XG5nb3ZfZmluZGVyID0gbmV3IEdvdkZpbmRlclxuZ292X2RldGFpbHMgPSBuZXcgR292RGV0YWlsc1xuZ292X2ZpbmRlci5vbl9zZWxlY3QgPSBnb3ZfZGV0YWlscy5zaG93XG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyMjXG5cbkdvdlNlbGVjdG9yID0gcmVxdWlyZSAnLi9nb3ZzZWxlY3Rvci5jb2ZmZWUnXG4jcmVuZGVyRGF0YSAgPSByZXF1aXJlICcuL2RhdGFyZW5kZXJlci5jb2ZmZWUnXG5fanFncyAgICAgICA9IHJlcXVpcmUgJy4vanF1ZXJ5LmdvdnNlbGVjdG9yLmNvZmZlZSdcbiNUZW1wbGF0ZXMgICAgICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzLmNvZmZlZSdcblRlbXBsYXRlczIgICAgICA9IHJlcXVpcmUgJy4vdGVtcGxhdGVzMi5jb2ZmZWUnXG5nb3ZtYXAgICAgICA9IHJlcXVpcmUgJy4vZ292bWFwLmNvZmZlZSdcblxuZ292X3NlbGVjdG9yID0gbmV3IEdvdlNlbGVjdG9yICcudHlwZWFoZWFkJywgJ2RhdGEvaF90eXBlcy5qc29uJywgN1xuI3RlbXBsYXRlcyA9IG5ldyBUZW1wbGF0ZXNcbnRlbXBsYXRlcyA9IG5ldyBUZW1wbGF0ZXMyXG5cbmFjdGl2ZV90YWI9XCJcIlxuXG53aW5kb3cucmVtZW1iZXJfdGFiID0obmFtZSktPlxuICBhY3RpdmVfdGFiID0gbmFtZVxuXG5hY3RpdmF0ZV90YWIgPSgpIC0+XG4gICQoXCIjZmllbGRUYWJzIGFbaHJlZj0nIyN7YWN0aXZlX3RhYn0nXVwiKS50YWIoJ3Nob3cnKVxuXG5nb3Zfc2VsZWN0b3Iub25fc2VsZWN0ZWQgPSAoZXZ0LCBkYXRhLCBuYW1lKSAtPlxuICAjcmVuZGVyRGF0YSAnI2RldGFpbHMnLCBkYXRhXG4gICQoJyNkZXRhaWxzJykuaHRtbCB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgZGF0YSlcbiAgYWN0aXZhdGVfdGFiKClcbiAgZ2V0X3JlY29yZCBcImluY19pZDoje2RhdGFbXCJpbmNfaWRcIl19XCJcbiAgcmV0dXJuXG5cblxuZ2V0X3JlY29yZCA9IChxdWVyeSkgLT5cbiAgJC5hamF4XG4gICAgdXJsOiBcImh0dHBzOi8vYXBpLm1vbmdvbGFiLmNvbS9hcGkvMS9kYXRhYmFzZXMvZ292d2lraS9jb2xsZWN0aW9ucy9nb3ZzLz9xPXsje3F1ZXJ5fX0mZj17X2lkOjB9Jmw9MSZhcGlLZXk9MFk1WF9RazJ1T0pSZEhKV0pLU1JXazZsNkpxVlRTMnlcIlxuICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICBjYWNoZTogdHJ1ZVxuICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgI2lmIGRhdGEubGVuZ3RoIHRoZW4gcmVuZGVyRGF0YSAnI2RldGFpbHMnLCAgZGF0YVswXVxuICAgICAgaWYgZGF0YS5sZW5ndGhcbiAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sIHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBkYXRhWzBdKVxuICAgICAgICBhY3RpdmF0ZV90YWIoKVxuICAgICAgICAkKCcjbWFwYXJlYScpLmNzcygndmlzaWJpbGl0eScsJ3Zpc2libGUnKVxuICAgICAgICBnb3ZtYXAuZ2VvY29kZSBkYXRhWzBdXG4gICAgICByZXR1cm5cblxuIyQoJy5nb3YnKS5nb3ZzZWxlY3RvcigpXG53aW5kb3cuZ2VvY29kZV9hZGRyID0gKGlucHV0X3NlbGVjdG9yKS0+XG4gIGdvdm1hcC5nb2NvZGVfYWRkciAkKGlucHV0X3NlbGVjdG9yKS52YWwoKVxuXG4kKCcjbWFwYXJlYScpLmNzcygndmlzaWJpbGl0eScsJ2hpZGRlbicpXG4iLCJcblxuXG4jIFRha2VzIGFuIGFycmF5IG9mIGRvY3MgdG8gc2VhcmNoIGluLlxuIyBSZXR1cm5zIGEgZnVuY3Rpb25zIHRoYXQgdGFrZXMgMiBwYXJhbXMgXG4jIHEgLSBxdWVyeSBzdHJpbmcgYW5kIFxuIyBjYiAtIGNhbGxiYWNrIHRoYXQgd2lsbCBiZSBjYWxsZWQgd2hlbiB0aGUgc2VhcmNoIGlzIGRvbmUuXG4jIGNiIHJldHVybnMgYW4gYXJyYXkgb2YgbWF0Y2hpbmcgZG9jdW1lbnRzLlxuIyBtdW1faXRlbXMgLSBtYXggbnVtYmVyIG9mIGZvdW5kIGl0ZW1zIHRvIHNob3dcblF1ZXJ5TWF0aGVyID0gKGRvY3MsIG51bV9pdGVtcz01KSAtPlxuICAocSwgY2IpIC0+XG4gICAgdGVzdF9zdHJpbmcgPShzLCByZWdzKSAtPlxuICAgICAgKGlmIG5vdCByLnRlc3QocykgdGhlbiByZXR1cm4gZmFsc2UpICBmb3IgciBpbiByZWdzXG4gICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgW3dvcmRzLHJlZ3NdID0gZ2V0X3dvcmRzX3JlZ3MgcVxuICAgIG1hdGNoZXMgPSBbXVxuICAgICMgaXRlcmF0ZSB0aHJvdWdoIHRoZSBwb29sIG9mIGRvY3MgYW5kIGZvciBhbnkgc3RyaW5nIHRoYXRcbiAgICAjIGNvbnRhaW5zIHRoZSBzdWJzdHJpbmcgYHFgLCBhZGQgaXQgdG8gdGhlIGBtYXRjaGVzYCBhcnJheVxuXG4gICAgZm9yIGQgaW4gZG9jc1xuICAgICAgaWYgbWF0Y2hlcy5sZW5ndGggPj0gbnVtX2l0ZW1zIHRoZW4gYnJlYWtcbiAgICAgIGlmIHRlc3Rfc3RyaW5nKGQuZ292X25hbWUsIHJlZ3MpIHRoZW4gbWF0Y2hlcy5wdXNoICQuZXh0ZW5kKHt9LCBkKVxuICAgIFxuICAgIHNlbGVjdF90ZXh0IG1hdGNoZXMsIHdvcmRzLCByZWdzXG4gICAgY2IgbWF0Y2hlc1xuICAgIHJldHVyblxuIFxuXG4jIGluc2VydHMgPHN0cm9uZz4gZWxlbWVudHNlIGluIGFycmF5XG5zZWxlY3RfdGV4dCA9IChjbG9uZXMsd29yZHMscmVncykgLT5cbiAgZm9yIGQgaW4gY2xvbmVzXG4gICAgZC5nb3ZfbmFtZT1zdHJvbmdpZnkoZC5nb3ZfbmFtZSwgd29yZHMsIHJlZ3MpXG4gIFxuICByZXR1cm4gY2xvbmVzXG5cblxuXG4jIGluc2VydHMgPHN0cm9uZz4gZWxlbWVudHNlXG5zdHJvbmdpZnkgPSAocywgd29yZHMsIHJlZ3MpIC0+XG4gIHJlZ3MuZm9yRWFjaCAocixpKSAtPlxuICAgIHMgPSBzLnJlcGxhY2UgciwgXCI8Yj4je3dvcmRzW2ldfTwvYj5cIlxuICByZXR1cm4gc1xuXG4jIHJlbW92ZXMgPD4gdGFncyBmcm9tIGEgc3RyaW5nXG5zdHJpcCA9IChzKSAtPlxuICBzLnJlcGxhY2UoLzxbXjw+XSo+L2csJycpXG5cblxuIyBhbGwgdGlybXMgc3BhY2VzIGZyb20gYm90aCBzaWRlcyBhbmQgbWFrZSBjb250cmFjdHMgc2VxdWVuY2VzIG9mIHNwYWNlcyB0byAxXG5mdWxsX3RyaW0gPSAocykgLT5cbiAgc3M9cy50cmltKCcnK3MpXG4gIHNzPXNzLnJlcGxhY2UoLyArL2csJyAnKVxuXG4jIHJldHVybnMgYW4gYXJyYXkgb2Ygd29yZHMgaW4gYSBzdHJpbmdcbmdldF93b3JkcyA9IChzdHIpIC0+XG4gIGZ1bGxfdHJpbShzdHIpLnNwbGl0KCcgJylcblxuXG5nZXRfd29yZHNfcmVncyA9IChzdHIpIC0+XG4gIHdvcmRzID0gZ2V0X3dvcmRzIHN0clxuICByZWdzID0gd29yZHMubWFwICh3KS0+IG5ldyBSZWdFeHAoXCIje3d9XCIsJ2lnJylcbiAgW3dvcmRzLHJlZ3NdXG5cblxubW9kdWxlLmV4cG9ydHMgPSBRdWVyeU1hdGhlclxuXG4iLCJ0YWJfbGF5b3V0MCA9W1xuICB7bmFtZTonR2VuZXJhbCcsIGZpZWxkczpbXG4gICAgXCJnb3ZfbmFtZVwiXG4gICAgXCJjZW5zdXNfaWRcIlxuICAgIFwic3BlY2lhbF9kaXN0cmljdF9mdW5jdGlvbl9jb2RlXCJcbiAgICBcImdvdl90eXBlXCJcbiAgICBcImNvdW50eV9hcmVhX25hbWVcIlxuICAgIFwiY291bnR5X2FyZWFfdHlwZVwiXG4gICAgXCJ3ZWJfc2l0ZVwiXG4gIF19XG4gIHtuYW1lOidBZGRyZXNzJywgZmllbGRzOltcbiAgICBcImNlbnN1c19jb250YWN0XCJcbiAgICBcImFkZHJlc3MxXCJcbiAgICBcImFkZHJlc3MyXCJcbiAgICBcImNpdHlcIlxuICAgIFwic3RhdGVcIlxuICAgIFwiemlwXCJcbiAgXX1cbiAge25hbWU6J1N0YXQnLCBmaWVsZHM6W1xuICAgIFwicG9wdWxhdGlvblwiXG4gICAgXCJwb3B1bGF0aW9uX2FzX29mX3llYXJcIlxuICAgIFwiZW5yb2xsbWVudFwiXG4gICAgXCJlbnJvbGxtZW50X2FzX29mX3llYXJcIlxuICAgIFwiZmlwc19zdGF0ZVwiXG4gICAgXCJmaXBzX2NvdW50eVwiXG4gICAgXCJmaXBzX3BsYWNlXCJcbiAgXX1cbiAge25hbWU6J0xvY2F0aW9uJywgZmllbGRzOltcbiAgICBcImxhdGl0dWRlXCJcbiAgICBcImxvbmdpdHVkZVwiXG4gIF19XG4gIHtuYW1lOidPdGhlcicsIGZpZWxkczpbXG4gICAgXCJpbmNfaWRcIlxuICBdfVxuXVxuXG5cbiMjI1xuIyBmaWxlOiB0ZW1wbGF0ZXMyLmNvZmZlZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jXG4jIENsYXNzIHRvIG1hbmFnZSB0ZW1wbGF0ZXMgYW5kIHJlbmRlciBkYXRhIG9uIGh0bWwgcGFnZS5cbiNcbiMgVGhlIG1haW4gbWV0aG9kIDogcmVuZGVyKGRhdGEpLCBnZXRfaHRtbChkYXRhKVxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMjI1xuXG5cblxuXG5yZW5kZXJfZmllbGRfdmFsdWUgPShuLGRhdGEpIC0+XG4gIHY9ZGF0YVtuXVxuICBpZiBuID09IFwid2ViX3NpdGVcIlxuICAgIHJldHVybiBcIjxhIHRhcmdldD0nX2JsYW5rJyBocmVmPScje3Z9Jz4je3Z9PC9hPlwiXG4gIGVsc2VcbiAgICByZXR1cm4gdlxuICBcbiAgXG5cbnJlbmRlcl9maWVsZCA9IChmTmFtZSxkYXRhKS0+XG4gIHJldHVybiAnJyAgdW5sZXNzIGZWYWx1ZSA9IGRhdGFbZk5hbWVdXG4gIFwiXCJcIlxuICA8ZGl2PlxuICAgICAgPHNwYW4gY2xhc3M9J2YtbmFtJz4je2ZpZWxkTmFtZXNbZk5hbWVdfTwvc3Bhbj5cbiAgICAgIDxzcGFuIGNsYXNzPSdmLXZhbCc+I3tyZW5kZXJfZmllbGRfdmFsdWUoZk5hbWUsZGF0YSl9PC9zcGFuPlxuICA8L2Rpdj5cbiAgXCJcIlwiXG4gIFxucmVuZGVyX2ZpZWxkcyA9KCBmaWVsZHMsIGRhdGEpIC0+XG4gICggcmVuZGVyX2ZpZWxkKGYsIGRhdGEpIGZvciBmIGluIGZpZWxkcykuam9pbignJylcblxuXG51bmRlciA9IChzKSAtPiBzLnJlcGxhY2UoLyAvZywgJ18nKVxuXG5cbnJlbmRlcl90YWJzID0gKGxheW91dCxkYXRhKSAtPlxuICAjcmVuZGVyIGhlYWRlclxuICBoID0gJzxkaXYgcm9sZT1cInRhYnBhbmVsXCIgc3R5bGU9XCJmb250LXNpemU6MTUwJTtcIj4nXG5cbiAgI3JlbmRlciB0YWJzXG4gIGggKz0nPHVsIGlkPVwiZmllbGRUYWJzXCIgY2xhc3M9XCJuYXYgbmF2LXRhYnNcIiByb2xlPVwidGFibGlzdFwiPidcbiAgXG4gIGZvciB0YWIsaSBpbiBsYXlvdXRcbiAgICBhY3RpdmUgPSBpZiBpPjAgdGhlbiAnJyBlbHNlICdhY3RpdmUnXG4gICAgaCArPVwiXCJcIlxuICAgICAgPGxpIHJvbGU9XCJwcmVzZW50YXRpb25cIiBjbGFzcz1cIiN7YWN0aXZlfVwiIG9uY2xpY2s9XCJyZW1lbWJlcl90YWIoJyN7dW5kZXIodGFiLm5hbWUpfScpXCI+XG4gICAgICAgIDxhIGhyZWY9XCIjI3t1bmRlcih0YWIubmFtZSl9XCIgYXJpYS1jb250cm9scz1cImhvbWVcIiByb2xlPVwidGFiXCIgZGF0YS10b2dnbGU9XCJ0YWJcIj5cbiAgICAgICAgI3t0YWIubmFtZX1cbiAgICAgICAgPC9hPlxuICAgICAgPC9saT5cbiAgICBcIlwiXCJcblxuICBoICs9ICc8L3VsPidcbiAgaCArPSAnPGRpdiBjbGFzcz1cInRhYi1jb250ZW50XCI+J1xuXG4gICNyZW5kZXIgdGFicyBjb250ZW50XG4gIGZvciB0YWIsaSBpbiBsYXlvdXRcbiAgICBhY3RpdmUgPSBpZiBpPjAgdGhlbiAnJyBlbHNlICdhY3RpdmUnXG4gICAgaCArPVwiXCJcIlxuICAgIDxkaXYgcm9sZT1cInRhYnBhbmVsXCIgY2xhc3M9XCJ0YWItcGFuZSAje2FjdGl2ZX1cIiBpZD1cIiN7dW5kZXIodGFiLm5hbWUpfVwiIHN0eWxlPVwicGFkZGluZy10b3A6IDQwcHg7XCI+XG4gICAgICAgICN7cmVuZGVyX2ZpZWxkcyB0YWIuZmllbGRzLCBkYXRhfVxuICAgIDwvZGl2PlxuICAgIFwiXCJcIlxuICBcbiAgI3JlbmRlciBmb290ZXJcbiAgaCArPSc8L2Rpdj4nXG4gIGggKz0nPC9kaXY+J1xuICByZXR1cm4gaFxuXG5cblxuXG5cblxuY2xhc3MgVGVtcGxhdGVzMlxuICBAbGlzdCA9IHVuZGVmaW5lZFxuXG5cbiAgY29uc3RydWN0b3I6KCkgLT5cbiAgICBAbGlzdCA9IFtdXG4gICAgQGxpc3QucHVzaFxuICAgICAgbmFtZTpcInRhYnNcIlxuICAgICAgcmVuZGVyOihkYXQpIC0+XG4gICAgICAgIHJlbmRlcl90YWJzKHRhYl9sYXlvdXQwLCBkYXQpXG5cblxuICBnZXRfbmFtZXM6IC0+XG4gICAgKHQubmFtZSBmb3IgdCBpbiBAbGlzdClcblxuICBnZXRfaW5kZXhfYnlfbmFtZTogKG5hbWUpIC0+XG4gICAgZm9yIHQsaSBpbiBAbGlzdFxuICAgICAgaWYgdC5uYW1lIGlzIG5hbWVcbiAgICAgICAgcmV0dXJuIGlcbiAgICByZXR1cm4gLTFcblxuICBnZXRfaHRtbDogKGluZCwgZGF0YSkgLT5cbiAgICByZXR1cm4gaWYgKGluZCBpcyAtMSkgdGhlbiAgXCJcIiBlbHNlIEBsaXN0W2luZF0ucmVuZGVyKGRhdGEpXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFRlbXBsYXRlczJcbiJdfQ==
