#!/bin/bash

mongo ds045521.mongolab.com:45521/govwiki -u joffemd -p pscs@2O12 --quiet --eval 'printjson(db.govs_norm.find().limit(8))'
