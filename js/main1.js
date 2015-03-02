var fieldNames ={
    "census_id"                      : "Census ID"                              ,
    "gov_name"                       : "Name"                                   ,
    "special_district_function_code" : "Special Purpose District Function Code" ,
    "gov_type"                       : "Government Type"                        ,
    "census_contact"                 : "Census Contact"                         ,
    "address1"                       : "Address Line 1"                         ,
    "address2"                       : "Address Line 2"                         ,
    "city"                           : "City"                                   ,
    "state"                          : "State"                                  ,
    "zip"                            : "Zip Code"                               ,
    "web_site"                       : "Web Site Address"                       ,
    "population"                     : "Population"                             ,
    //No label; place value in parenthesis next to Population"                  ,
    "population_as_of_year"          : ""                                       ,
    "enrollment"                     : "Enrollment"                             ,
    //No label; place value in parenthesis next to Enrollment"                  ,
    "enrollment_as_of_year"          : ""                                       ,
    "fips_state"                     : "FIPS State Code"                        ,
    "fips_county"                    : "FIPS County Code"                       ,
    "fips_place"                     : "FIPS Place Code"                        ,
    "county_area_name"               : "County (or County Equivalent) Name"     ,
    "county_area_type"               : "County Type"

}
var substringMatcher = function(strs) {
    return function findMatches(q, cb) {
        var matches, substrRegex;

        // an array that will be populated with substring matches
        matches = [];

        // regex used to determine if a string contains the substring `q`
        substrRegex = new RegExp(q, 'i');

        // iterate through the pool of strings and for any string that
        // contains the substring `q`, add it to the `matches` array
        //var counter=0;
        $.each(strs, function(i, str) {
            if (substrRegex.test(str.gov_name)) {
                //  the typeahead jQuery plugin expects suggestions to a
                // JavaScript object, refer to typeahead docs for more info
                matches.push(str);
                if (matches.length >= 14) return false;
            }
        });

        cb(matches);
    };
};

var suggestionTemplate = Handlebars.compile('<p><span class="minwidth">{{gov_name}}</span> <span class="smaller">{{state}} &nbsp;{{zip}}</span></p>');

var ta;

function startSuggestion(){
    
    $('.typeahead').attr('placeholder',"GOVERNMENT NAME");
    ta = $('.typeahead').typeahead({
        hint: true,
        highlight: true,
        minLength: 1
    }, {
        name: 'gov_name',
        displayKey: 'gov_name',
        source: substringMatcher(govs),
        templates: {
            suggestion: suggestionTemplate
        }
    });
    
    function link(v){
        return ((""+v).indexOf("http://") == -1)? v : '<a target="_blank" href="'+v+'">'+v+'</a>';
    }    

    function makeFieldHtml(n,v){
        var s="";
        if (v){
            s+='<p><span class="f-nam">'+ fieldNames[n] +'</span>';
            s+='   <span class="f-val">'+link(v)+'</span></p><br>';
        }
        return s;
    }

    function makeRecordHtml(data){
        var s="";
        for (n in data){
            s+= makeFieldHtml(n,data[n])
        }
        $('#details').html(s);
    }

    // Attach initialized event to it
    ta.on('typeahead:selected', function(evt, data, name) { makeRecordHtml(data);});


}

$.ajax({
      url:"data/govs.js",
      dataType: "script",
      cache: true,
      success: startSuggestion
});

