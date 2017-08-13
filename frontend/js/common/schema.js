/*Copyright 2017 Timofey Rechkalov <ntsdk@yandex.ru>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
   limitations under the License. */

/*global
 // Utils
 */

"use strict";

(function(callback){
    
    function Schema(exports, R, CommonUtils, Constants) {
    
        exports.getSchema = function(base) {
            var schema = {
                "$schema": "http://json-schema.org/draft-04/schema#",
                "title": "SMTK NIMS base",
                "description": "SMTK NIMS base schema.",
                "type": "object",
                'definitions': {}
            };
    
            var Meta =  getMetaSchema();
            var Log =  getLogSchema();
            var Assets =  getAssetsSchema();
            var Shops =  getShopsSchema();
//            var CharacterProfileStructure =  getProfileSettingsSchema();
//            var PlayerProfileStructure =  CharacterProfileStructure;
//            var Characters =  getProfileSchema(base.CharacterProfileStructure);
//            var Players =  getProfileSchema(base.PlayerProfileStructure);
//            var ProfileBindings =  getProfileBindings(base.Characters, base.Players);
//            var Stories =  getStoriesSchema(base.Characters);
//            var Groups =  getGroupsSchema(base.CharacterProfileStructure, base.PlayerProfileStructure);
//            var InvestigationBoard = getInvestigationBoardSchema(base.Groups, base.InvestigationBoard);
//            var Relations = getRelationsSchema(base.Characters, schema.definitions);
//            var ManagementInfo = {};
//            if(base.ManagementInfo){
//                ManagementInfo =  getManagementInfoSchema(base.ManagementInfo, base.Characters, base.Stories, base.Groups, base.Players);
//            }
    
            schema.properties = {
                Meta : Meta,
                Shops : Shops,
                Assets : Assets,
//                CharacterProfileStructure : CharacterProfileStructure,
//                PlayerProfileStructure : PlayerProfileStructure,
//                Characters : Characters,
//                Players : Players,
//                ProfileBindings : ProfileBindings,
//                Stories : Stories,
                Version : {
                    "type" : "string"
                },
                Master : {
                    "type" : "object",
                    "properties": {
                        "name" : {
                            "type":"string",
                        },
                        "password" : {
                            "type":"string",
                        },
                    }
                },
                Log : Log,
//                Groups : Groups,
//                InvestigationBoard: InvestigationBoard,
                Settings: {},
                Misc: {},
//                Relations: Relations,
//                ManagementInfo: ManagementInfo
            };
            schema.required = ['Meta','Shops','Assets','Version','Log'];
//            schema.required = ["Meta", "CharacterProfileStructure", "PlayerProfileStructure", "Version", "Characters", 
//                               "Players", "ProfileBindings", "Stories", "Log", 'Groups', 'InvestigationBoard', 'Relations'];
            schema.additionalProperties = false;
            
            return schema;
        };
        
        function getMetaSchema() {
            return {
                "title": "Meta",
                "description": "Contains meta data for game: name, description, dates and saving time.",
                "type": "object",
                "properties": {
                    "name" : {
                        "type":"string",
                        "description":"Game name"
                    },
                    "date" : {
                        "type":"string",
                        "description":"Time of starting game in game universe."
                    },
                    "preGameDate" : {
                        "type":"string",
                        "description":"Time of starting pregame events in game universe."
                    },
                    "description" : {
                        "type":"string",
                        "description":"Description text for game."
                    },
                    "saveTime" : {
                        "type":"string",
                        "description":"Stringified date of last database saving."
                    }
                },
                "required": ["name","date","preGameDate","description","saveTime"],
                "additionalProperties": false
            };
        };
        
        function getProfileSettingsSchema() {
            return {
                "title": "CharacterProfileStructure",
                "description": "Describes character profile settings.",
                "type": "array",
                "items" : {
                    'oneOf' : [ {
                        "type" : "object",
                        "properties" : {
                            "name" : {
                                "type" : "string"
                            },
                            "type" : {
                                "type" : "string",
                                "enum" : [ "string", "text", "enum", 'multiEnum' ]
                            },
                            "value" : {
                                "type" : [ "string" ]
                            },
                            "doExport" : {
                                "type" : "boolean"
                            },
                            "showInRoleGrid" : {
                                "type" : "boolean"
                            },
                            "playerAccess" : {
                                "type" : "string",
                                "enum" : [ "write", "readonly", "hidden" ]
                            },
                        },
                        "required" : [ "name", "type", "value", "doExport", "playerAccess","showInRoleGrid"],
                        "additionalProperties" : false
                    }, {
                        "type" : "object",
                        "properties" : {
                            "name" : {
                                "type" : "string"
                            },
                            "type" : {
                                "type" : "string",
                                "enum" : [ "number" ]
                            },
                            "value" : {
                                "type" : [ "number" ]
                            },
                            "doExport" : {
                                "type" : "boolean"
                            },
                            "showInRoleGrid" : {
                                "type" : "boolean"
                            },
                            "playerAccess" : {
                                "type" : "string",
                                "enum" : [ "write", "readonly", "hidden" ]
                            },
                        },
                        "required" : [ "name", "type", "value", "doExport", "playerAccess", "showInRoleGrid" ],
                        "additionalProperties" : false
                    }, {
                        "type" : "object",
                        "properties" : {
                            "name" : {
                                "type" : "string"
                            },
                            "type" : {
                                "type" : "string",
                                "enum" : [ "checkbox" ]
                            },
                            "value" : {
                                "type" : [ "boolean" ]
                            },
                            "doExport" : {
                                "type" : "boolean"
                            },
                            "showInRoleGrid" : {
                                "type" : "boolean"
                            },
                            "playerAccess" : {
                                "type" : "string",
                                "enum" : [ "write", "readonly", "hidden" ]
                            },
                        },
                        "required" : [ "name", "type", "value", "doExport", "playerAccess", "showInRoleGrid" ],
                        "additionalProperties" : false
                    } ]
                }
            };
        };
        
        function getLogSchema(){
            return {
                "type" : "array",
                "items" : {
                    "type" : "array",
                    "items" : {
                        "type" : "string",
                    },
                    "minItems" : 4,
                    "maxItems": 4
                }
            };
        };
        
        function getInvestigationBoardSchema(groups, investigationBoard){
            
            var ibGroupNames = Object.keys(investigationBoard.groups);
            var relGroupNames = ibGroupNames.map(function(groupName){
                return 'group-' + groupName;
            });
            var resourceNames = Object.keys(investigationBoard.resources);
            var relResourceNames = resourceNames.map(function(resourceName){
                return 'resource-' + resourceName;
            });
            
            var relationSetSchema = {
                "type" : "object",
                "properties" : {},
                "additionalProperties" : false
            };
            relGroupNames.forEach(function(relGroupName){
                relationSetSchema.properties[relGroupName] = {
                    "type" : "string"
                };
            });
            relResourceNames.forEach(function(relResourceName){
                relationSetSchema.properties[relResourceName] = {
                    "type" : "string"
                };
            });
            
            var relationsSchema = {
                "type" : "object",
                "properties" : {},
                "additionalProperties" : false
            };
            if(relGroupNames.length != 0){
                relationsSchema.required = relGroupNames;
            }
            
            relGroupNames.forEach(function(relGroupNames){
                relationsSchema.properties[relGroupNames] = relationSetSchema;
            });
            
            var resourcesSchema = {
                "type" : "object",
                "properties" : {},
                "additionalProperties" : false
            };
            
            resourceNames.forEach(function(resourceName){
                resourcesSchema.properties[resourceName] = {
                    "type" : "object",
                    "properties": {
                        "name" : {
                            'type' : 'string',
                            'enum': [resourceName]
                        }
                    },
                    "required" : ["name"],
                    "additionalProperties" : false
                }
            });
            
            var groupsSchema = {
                "type" : "object",
                "properties" : {},
                "additionalProperties" : false
            };
            var groupNames = Object.keys(groups);
            groupNames.forEach(function(groupName){
                groupsSchema.properties[groupName] = {
                    "type" : "object",
                    "properties": {
                        "name" : {
                            'type' : 'string',
                            'enum': [groupName]
                        },
                        'notes' : {
                            'type' : 'string'
                        }
                    },
                    "required" : [ "name", "notes"],
                    "additionalProperties" : false
                }
            });
            var schema = {
                "type" : "object",
                "properties": {
                    "groups" : groupsSchema, 
                    "resources" : resourcesSchema,
                    "relations" : relationsSchema
                }, 
                "required" : [ "groups", "resources", "relations"],
                "additionalProperties" : false
            };
            return schema;
        };
        
        function getShopsSchema() {
            var categoryProps2 = {
                "cost" : {
                    "type" : "number"
                }
            };
            var categoryProps = {
                "globals" : {
                    "type" : "object",
                    "additionalProperties": { 
                        "properties": categoryProps2,
                        "required": Object.keys(categoryProps2),
                        "additionalProperties": false
                    }
                }, 
                "locals" : {
                    "type" : "object",
                    "additionalProperties": { 
                        "properties": categoryProps2,
                        "required": Object.keys(categoryProps2),
                        "additionalProperties": false
                    }
                }
            };
            var localAssetProps = {
                "displayString" : {
                    "type" : "string"
                }, 
                "description" : {
                    "type" : "string"
                }
            };
            
            var shopProperties = {
                    "name" : {
                        "type" : "string"
                    }, 
                    "password" : {
                        "type" : "string"
                    }, 
                    "corporation" : {
                        "type" : "string"
                    }, 
                    "sellerLogin" : {
                        "type" : "string"
                    }, 
                    "sellerPassword" : {
                        "type" : "string"
                    }, 
                    "assets" : {
                        "type" : "object",
                        "additionalProperties": { 
                            "type": "boolean",
                            "enum": [true]
                        }
                    }, 
                    "localAssets" : {
                        "type" : "object",
                        "additionalProperties": { 
                            "type": "object",
                            "properties": localAssetProps,
                            "required": Object.keys(localAssetProps),
                            "additionalProperties": false
                        }
                    }, 
                    "categories" : {
                        "type" : "object",
                        "additionalProperties": { 
                            "type": "object",
                            "properties": categoryProps,
                            "required": Object.keys(categoryProps),
                            "additionalProperties": false
                        }
                    }
            };
            var schema = {
                    "type" : "object",
                    "additionalProperties": { 
                        "type": "object",
                        "properties": shopProperties,
                        "required": Object.keys(shopProperties),
                        "additionalProperties": false
                    }
            };
            return schema;
        }
        function getAssetsSchema() {
            var assetProperties = {
                "name" : {
                    "type" : "string"
                }, 
                "displayString" : {
                    "type" : "string"
                }, 
                "isPhysical" : {
                    "type" : "boolean"
                }, 
                "resourceCost" : {
                    "type" : "number"
                }, 
                "apiKey" : {
                    "type" : "string"
                }, 
                "description" : {
                    "type" : "string"
                }
            };
            var schema = {
                "type" : "object",
                "additionalProperties": { 
                    "type": "object",
                    "properties": assetProperties,
                    "required": Object.keys(assetProperties),
                    "additionalProperties": false
                }
            };
            return schema;
        }
        function getGroupsSchema(characterProfileSettings, playerProfileSettings) {
            var filterItems = [];
            var staticStringTemplate = {
                "type" : "object",
                "properties": {
                    "name" : {
                        "type" : "string",
                        "enum": [] // enum can't be empty, it is necessary to populate it
                    }, 
                    "type" :{
                        "type" : "string",
                        "enum": ["string"]
                    },
                    "regexString" :{
                        "type" : "string",
                        "minLength": 0
                    }
                }, 
                "required" : [ "name", "type", "regexString"],
                "additionalProperties" : false
            };
            
            let assocFunc = R.assocPath(['properties', 'name', 'enum']);
            filterItems.push(assocFunc([Constants.CHAR_NAME], R.clone(staticStringTemplate)));
            filterItems.push(assocFunc([Constants.CHAR_OWNER], R.clone(staticStringTemplate)));
            filterItems.push(assocFunc([Constants.PLAYER_NAME], R.clone(staticStringTemplate)));
            filterItems.push(assocFunc([Constants.PLAYER_OWNER], R.clone(staticStringTemplate)));
    
            filterItems = filterItems.concat(characterProfileSettings.map(makeProfileStructureItemSchema(Constants.CHAR_PREFIX)));
            filterItems = filterItems.concat(playerProfileSettings.map(makeProfileStructureItemSchema(Constants.PLAYER_PREFIX)));
            
            R.keys(R.fromPairs(Constants.summaryStats)).forEach(function(item){
                filterItems.push({
                    "type" : "object",
                    "properties" : {
                        "name" : {
                            "type" : "string",
                            "enum" : [ Constants.SUMMARY_PREFIX + item ]
                        },
                        "type" : {
                            "type" : "string",
                            "enum" : [ "number" ]
                        },
                        "num" :{
                            "type" : "number"
                        },
                        "condition" : {
                            "type" : "string",
                            "enum" : [ "greater", "lesser", "equal" ]
                        }
                    },
                    "required" : [ "name", "type", "num", "condition" ],
                    "additionalProperties" : false
                });
            });
            
            var groupProperties = {
                "name" : {
                    "type" : "string"
                }, 
                "masterDescription" : {
                    "type" : "string"
                }, 
                "characterDescription" : {
                    "type" : "string"
                }, 
                "filterModel" : {
                    "type" : "array", 
                    "items": {
                        "oneOf" : filterItems
                    }
                }, 
                "doExport" : {
                    "type":"boolean"
                }
            };
            var schema = {
                "type" : "object",
                "additionalProperties": { 
                    "type": "object",
                    "properties": groupProperties,
                    "required": Object.keys(groupProperties),
                    "additionalProperties": false
                }
            };
            return schema;
        }
        
        var makeProfileStructureItemSchema = R.curry(function(prefix, item){
            var data = {
                "type" : "object",
                "properties" : {
                    "name" : {
                        "type" : "string",
                        "enum" : [ prefix + item.name ]
                    },
                    "type" : {
                        "type" : "string",
                        "enum" : [ item.type ]
                    },
                },
                "required" : [ "name", "type" ],
                "additionalProperties" : false
            };

            switch (item.type) {
            case "text":
            case "string":
                data.properties.regexString = {
                    "type" : "string",
                    "minLength" : 0
                };
                data.required.push("regexString");
                break;
            case "number":
                data.properties.num = {
                    "type" : "number"
                };
                data.properties.condition = {
                    "type" : "string",
                    "enum" : [ "greater", "lesser", "equal" ]
                };
                data.required.push("num");
                data.required.push("condition");
                break;
            case "checkbox":
                data.properties.selectedOptions = {
                    "type" : "object",
                    "properties":{
                        "false" :{},
                        "true" :{}
                    },
                    "additionalProperties" : false
                }
                data.required.push("selectedOptions")
                break;
            case "enum":
                var properties = item.value.split(",").reduce(function(result, item){
                    result[item] = {};
                    return result;
                }, {});
                data.properties.selectedOptions = {
                    "type" : "object",
                    "properties": properties,
                    "additionalProperties" : false
                }
                data.required.push("selectedOptions");
                break;
            case "multiEnum":
                data.properties.condition = {
                    "type" : "string",
                    "enum" : [ "every", "equal", "some" ]
                };
                var properties = item.value.split(",").reduce(function(result, item){
                    result[item] = {};
                    return result;
                }, {});
                data.properties.selectedOptions = {
                    "type" : "object",
                    "properties": properties,
                    "additionalProperties" : false
                }
                data.required.push("selectedOptions")
                data.required.push("condition");
                break;
            default:
                console.log('Unexpected type ' + item.type);
            }
            return data;
        });
        
        function getProfileSchema(profileSettings) {
            var characterProperties = {
                "name" : {
                    "type" : "string"
                }
            };
            var value;
            profileSettings.forEach(function(item){
                switch(item.type){
                case "text":
                case "string":
                case "multiEnum": // it is hard to check multiEnum with schema. There is second check in consistency checker.
                    value = {
                        "type":"string"
                    };
                    break;
                case "checkbox":
                    value = {
                        "type":"boolean"
                    };
                    break;
                case "number":
                    value = {
                        "type":"number"
                    };
                    break;
                case "enum":
                    value = {
                        "type":"string",
                        "enum": item.value.split(",").map(function(item){
                            return item.trim();
                        })
                    };
                    break;
                default:
                    console.log('Unexpected type ' + item.type);
                }
                characterProperties[item.name] = value;
            });
            
    //        console.log(characterProperties);
            
            var schema = {
                "type" : "object",
                "additionalProperties": { 
                    "type": "object",
                    "properties": characterProperties,
                    "required":Object.keys(characterProperties),
                    "additionalProperties": false
                }
            };
            return schema;
        };
        
        function getProfileBindings(characters, players) {
            var playerNames = Object.keys(players);
            if(playerNames.length == 0){
                playerNames = ['123'];
            }
            
            var names = '^(' + R.keys(characters).map(CommonUtils.escapeRegExp).join('|') + ')$';
            var schema = {
                type : 'object',
                additionalProperties : false,
                patternProperties : {}
            };
            schema.patternProperties[names] = {
                type: 'string',
                enum: playerNames
            };
            
            return schema;
        }
        
        function getStoriesSchema(characters) {
            var charNames = Object.keys(characters);
            
            var eventCharacter = {
                    "type" : "object",
                    "properties": {
                        "text":{
                            "type":"string"
                        },
                        "time":{
                            "type":"string"
                        },
                        "ready":{
                            "type":"boolean"
                        }
                    },
                    "required":["text", "time"],
                    "additionalProperties" : false
            };
            
            var eventSchema = {
                "type" : "object",
                "properties" : {
                    "name":{
                        "type":"string"
                    },
                    "text":{
                        "type":"string"
                    },
                    "time":{
                        "type":"string"
                    },
                    "characters":{
                        "type" : "object",
                        // depends on story but for simplicity we check charNames only
                        "properties": charNames.reduce(function(obj, char){
                            obj[char] = eventCharacter;
                            return obj;
                        }, {}),
                        "additionalProperties" : false
                    }
                },
                "required":["name","text","time","characters"],
                "additionalProperties" : false
            };
            
            
            var storyCharacterSchema = {
                "type" : "object",
                "properties" : {
                    "name":{
                        "type":"string",
                        "enum": charNames
                    },
                    "inventory":{
                        "type":"string"
                    },
                    "activity":{
                        "type":"object",
                        "properties":{
                            "active":{
                                "type":"boolean"
                            },
                            "follower":{
                                "type":"boolean"
                            },
                            "defensive":{
                                "type":"boolean"
                            },
                            "passive":{
                                "type":"boolean"
                            },
                        },
                        "additionalProperties" : false
                    },
                },
                "required":["name","inventory","activity"],
                "additionalProperties" : false
            };
            
            var storySchema = {
                "type" : "object",
                "properties" : {
                    "name":{
                        "type":"string"
                    },
                    "story":{
                        "type":"string"
                    },
                    "characters": {
                        "type" : "object",
                        "properties": charNames.reduce(function(obj, char){
                            obj[char] = storyCharacterSchema;
                            return obj;
                        }, {}),
                        "additionalProperties" : false
                    },
                    "events":{
                        "type" : "array",
                        "items" : eventSchema
                    }
                },
                "required":["name","story","characters","events"],
                "additionalProperties" : false
            }
            
    
            var storiesSchema = {
                "type" : "object",
                "additionalProperties" : storySchema
            };
            
            return storiesSchema;
        };
        
        
        function getManagementInfoSchema(managementInfo, characters, stories, groups, players) {
            var charNames = Object.keys(characters);
            var storyNames = Object.keys(stories);
            var groupNames = Object.keys(groups);
            var playerNames = Object.keys(players);
            var userNames = Object.keys(managementInfo.UsersInfo);
            // enum can't be empty, ask about it here 
            // http://stackoverflow.com/questions/37635675/how-to-validate-empty-array-of-strings-with-ajv
            if(storyNames.length == 0){
                storyNames = ['123'];
            }
            if(charNames.length == 0){
                charNames = ['123'];
            }
            if(groupNames.length == 0){
                groupNames = ['123'];
            }
            if(playerNames.length == 0){
                playerNames = ['123'];
            }
            
            var userSchema = {
                "type" : "object",
                "properties" : {
                    "name" : {
                        "type" : "string"
                    },
                    "stories" : {
                        "type" : "array",
                        "items" : {
                            "type" : "string",
                            "enum" : storyNames
                        },
                        "minItems" : 0
                    },
                    "characters" : {
                        "type" : "array",
                        "items" : {
                            "type" : "string",
                            "enum" : charNames
                        }
                    },
                    "groups" : {
                        "type" : "array",
                        "items" : {
                            "type" : "string",
                            "enum" : groupNames
                        }
                    },
                    "players" : {
                        "type" : "array",
                        "items" : {
                            "type" : "string",
                            "enum" : playerNames
                        }
                    },
                    "salt" : {
                        "type" : "string"
                    },
                    "hashedPassword" : {
                        "type" : "string"
                    },
                },
                "required" : [ "name", "stories", "characters", "groups", "players", "salt", "hashedPassword" ],
                "additionalProperties" : false
            };
            var playerSchema = {
                "type" : "object",
                "properties" : {
                    "name" : {
                        "type" : "string"
                    },
                    "salt" : {
                        "type" : "string"
                    },
                    "hashedPassword" : {
                        "type" : "string"
                    },
                },
                "required" : [ "name", "salt", "hashedPassword" ],
                "additionalProperties" : false
            };
            var playersOptionsSchema = {
                "type" : "object",
                "properties" : {
                    "allowPlayerCreation" : {
                        "type" : "boolean"
                    },
                    "allowCharacterCreation" : {
                        "type" : "boolean"
                    },
                },
                "required" : [ "allowPlayerCreation", "allowCharacterCreation" ],
                "additionalProperties" : false
            };
            
            var managementInfoSchema = {
                "type" : "object",
                "properties" :{
                    "UsersInfo": {
                        "type":"object",
                        "additionalProperties" : userSchema
                    },
                    "PlayersInfo": {
                        "type":"object",
                        "additionalProperties" : playerSchema
                    },
                    "admin": {
                        "type":"string",
                        "enum": userNames
                    },
                    "editor": {
                        "type": [ "string", "null" ],
                        "enum": userNames.concat(null)
                    },
                    "adaptationRights": {
                        "type":"string",
                        "enum": ["ByStory", "ByCharacter"]
                    },
                    "WelcomeText": {
                        "type":"string",
                    },
                    "PlayersOptions": playersOptionsSchema,
                },
                "required":["UsersInfo","PlayersInfo","admin","editor","adaptationRights",'WelcomeText', "PlayersOptions"],
                "additionalProperties" : false
            };
            
            return managementInfoSchema;
        };
        
        function getRelationsSchema(Characters, definitions){
            var names = '^(' + R.keys(Characters).map(CommonUtils.escapeRegExp).join('|') + ')$';
            var schema = {
                type : 'object',
                additionalProperties : false,
                patternProperties : {}
            };
            schema.patternProperties[names] = {
                type: 'object',
                additionalProperties: false,
                patternProperties: {}
            };
            schema.patternProperties[names].patternProperties[names] = {
                type: 'string',
                minLength: 1
            };
            
            return schema;
        };
    };
    
    callback(Schema);
    
})(function(api){
    typeof exports === 'undefined'? api(this['Schema'] = {}, R, CommonUtils, Constants) : module.exports = api;
}.bind(this));