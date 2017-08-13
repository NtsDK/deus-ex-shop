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

(function(exports) {
    
    exports.migrate = function(data) {
        if (!data.Version) {

            data.Settings = {};

            var story, storyCharacters;
            Object.keys(data.Stories).forEach(function(storyName) {
                story = data.Stories[storyName];
                storyCharacters = Object.keys(story.characters);
                storyCharacters.forEach(function(character) {
                    story.characters[character].activity = {};
                });
            });

            data.Version = "0.0.4";
        }
        if (data.Version === "0.0.4") { // new versioning rule
            data.Version = "0.4.1";
        }
        if(data.Version === "0.4.1"){ // new 
            delete data.Settings["Events"];
            data.Version = "0.4.3";
        }
        if(data.Version === "0.4.3"){
            data.Log = [];
            data.Version = "0.4.4";
            data.Meta.saveTime = new Date();
        }
        if(data.Version === "0.4.4"){
            // see #3
            var char, story;
            Object.keys(data.Characters).forEach(function(charName) {
                char = data.Characters[charName];
                delete char.displayName;
            });
            Object.keys(data.Stories).forEach(function(storyName) {
                story = data.Stories[storyName];
                delete story.displayName;
            });
            data.Version = "0.4.4u1";
        }
        if(data.Version === "0.4.4u1"){
            // see #12
            data.ProfileSettings.forEach(function(item){
                item.doExport = true;
            });
            data.Meta.saveTime = new Date().toString();
            // see #13
            for(var storyName in data.Stories){
                var story = data.Stories[storyName];
                story.events.forEach(function(event){
                    delete event.index;
                    delete event.storyName;
                });
            }
            // see #17
            for(var storyName in data.Stories){
                var story = data.Stories[storyName];
                story.events.forEach(function(event){
                    for(var character in event.characters){
                        delete event.characters[character].name;
                        event.characters[character].time = "";
                    }
                });
            }
            data.Version = "0.4.4u2";
        }
        if(data.Version === "0.4.4u2"){
            // see #17 - reopened
            for(var storyName in data.Stories){
                var story = data.Stories[storyName];
                story.events.forEach(function(event){
                    for(var character in event.characters){
                        delete event.characters[character].name;
                    }
                });
            }
            data.Version = "0.4.4u3";
        }
        if(data.Version === "0.4.4u3"){
            data.Groups = {};
            if(data.ManagementInfo){
                for(var userName in data.ManagementInfo.UsersInfo){
                    data.ManagementInfo.UsersInfo[userName].groups = [];
                }
            }
            
            data.Version = "0.5.0";
        }
        if(data.Version === "0.5.0"){
            data.InvestigationBoard = {
                groups : {},
                resources : {},
                relations : {}
            };
            data.Version = "0.5.1";
        }
        if(data.Version === "0.5.1"){
            data.Relations = {};
            data.Version = "0.5.2";
        }
        if(data.Version === "0.5.2"){
            if(data.Meta.date === ''){
                data.Meta.date = '1970/01/01 00:00';
            }
            if(data.Meta.preGameDate === ''){
                data.Meta.preGameDate = '1970/01/01 00:00';
            }
            data.Version = "0.5.2u1";
        }
        if(data.Version === "0.5.2u1"){
            data.CharacterProfileStructure = data.ProfileSettings;
            delete data.ProfileSettings;
            data.PlayerProfileStructure = [];
            data.Players = {};
            data.ProfileBindings = {};
            if(data.ManagementInfo){
                for(var userName in data.ManagementInfo.UsersInfo){
                    data.ManagementInfo.UsersInfo[userName].players = [];
                }
            }
            data.Version = "0.5.3";
        }
        if(data.Version === "0.5.3"){
            if(data.ManagementInfo){
                data.ManagementInfo.PlayersInfo = {};
                data.ManagementInfo.WelcomeText = '';
                data.ManagementInfo.PlayersOptions = {
                    allowPlayerCreation: false,
                    allowCharacterCreation: false,
                };
            }
            data.Version = "0.6.0";
        }
        if(data.Version === "0.6.0"){
            data.CharacterProfileStructure.forEach(function(item){
                item.playerAccess = 'hidden';
            });
            data.PlayerProfileStructure.forEach(function(item){
                item.playerAccess = 'hidden';
            });
            data.Version = "0.6.1";
        }
        if(data.Version === "0.6.1"){
            data.CharacterProfileStructure.forEach(function(item){
                item.showInRoleGrid = false;
            });
            data.PlayerProfileStructure.forEach(function(item){
                item.showInRoleGrid = false;
            });
            data.Version = "0.6.2";
        }
        if(data.Version === "0.6.2"){
            data.Shops = {};
            data.Assets = {};
            data.Version = "0.6.3";
        }
        if(data.Version === "0.6.3"){
            Object.keys(data.Shops).forEach( shopName => {
                data.Shops[shopName].corporation = "";
            });
            Object.keys(data.Assets).forEach( name => {
                data.Assets[name].displayString = "";
                data.Assets[name].isPhysical = false;
                data.Assets[name].resourceCost = 0;
                data.Assets[name].apiKey = "";
                data.Assets[name].description = "";
            });
            
            data.Version = "0.6.4";
        }
        if(data.Version === "0.6.4"){
            Object.keys(data.Shops).forEach( shopName => {
                R.keys(data.Shops[shopName].localAssets).forEach((name) => {
                    data.Shops[shopName].localAssets[name] = {
                        description: '',
                        displayString: ''
                    };
                });
            });
            Object.keys(data.Shops).forEach( shopName => {
                R.keys(data.Shops[shopName].categories).forEach((name) => {
                    data.Shops[shopName].categories[name] = {
                        globals: {},
                        locals: {}
                    };
                });
            });
            data.Version = "0.6.5";
        }
        if(data.Version === "0.6.5"){
            delete data.CharacterProfileStructure ;
            delete data.PlayerProfileStructure    ;
            delete data.Characters                ;
            delete data.Players                   ;
            delete data.ProfileBindings           ;
            delete data.Stories                   ;
            delete data.Groups                    ;
            delete data.InvestigationBoard        ;
            delete data.Relations                 ;
            delete data.ManagementInfo            ;
            data.Version = "0.6.6";
        }
        if(data.Version === "0.6.6"){
            Object.keys(data.Shops).forEach( shopName => {
                data.Shops[shopName].sellerLogin = "";
                data.Shops[shopName].sellerPassword = "";
            });
            data.Version = "0.6.7";
        }
        if(data.Version === "0.6.7"){
            data.Misc = {};
            data.Version = "0.6.8";
        }
        if(data.Version === "0.6.8"){
            data.Misc.Themes = {};
            data.Version = "0.6.9";
        }
        
        
        return data;
    };
    
})(typeof exports === 'undefined' ? this['Migrator'] = {} : exports);
