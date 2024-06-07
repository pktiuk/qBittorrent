/*
 * Bittorrent Client using Qt and libtorrent.
 * Copyright (C) 2024  Paweł Kotiuk <kotiuk@zohomail.eu>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * In addition, as a special exception, the copyright holders give permission to
 * link this program with the OpenSSL project"s "OpenSSL" library (or with
 * modified versions of it that use the same license as the "OpenSSL" library),
 * and distribute the linked executables. You must obey the GNU General Public
 * License in all respects for all of the code used other than "OpenSSL".  If you
 * modify file(s), you may extend this exception to your version of the file(s),
 * but you are not obligated to do so. If you do not wish to do so, delete this
 * exception statement from your version.
 */

"use strict";

/*
File implementing auto-fill for the path input field in the path dialogs.
*/
if (window.qBittorrent === undefined)
    window.qBittorrent = {};

window.qBittorrent.pathAutofill = (() => {

    const exports = function() {
        return {
            attachPathAutofill: attachPathAutofill
        };
    };

    function showInputSuggestions(inputElement, names) {
        let datalist = document.getElementById(inputElement.id + "_suggestions");
        if (datalist) {
            datalist.innerHTML = "";
        }
        else {
            datalist = document.createElement("datalist");
            datalist.id = inputElement.id + "_suggestions";
            inputElement.setAttribute("list", datalist.id);
        }
        inputElement.appendChild(datalist);
        for (let i = 0; i < names.length; i++) {
            const option = document.createElement("option");
            option.value = names[i];
            datalist.appendChild(option);
        }
    }

    async function showPathSuggestions(element, mode) {
        const partialPath = element.value;
        if (partialPath === "") {
            return;
        }
        const filesListRequest = new Request({
            url: "api/v2/app/getDirectoryContent?dirPath=" + partialPath + "&mode=" + mode,
            method: "get"
        });
        try {
            await filesListRequest.send();
            const filesList = JSON.parse(filesListRequest.response.text);
            showInputSuggestions(element, filesList);
        }
        catch (err) {
            // directory does not exist
        }
    }

    async function handleDirSuggestions() {
        showPathSuggestions(this, "dirs");
    }

    async function handleFilesSuggestions() {
        showPathSuggestions(this, "all");
    }

    //get all input text fields with class path_directory class="path_directory"
    function attachPathAutofill() {
        const directoryInputs = document.getElementsByClassName("path_directory");
        for (let i = 0; i < directoryInputs.length; i++) {
            //listen for typing events
            directoryInputs[i].addEventListener("input", handleDirSuggestions);
        }
        const fileInputs = document.getElementsByClassName("path_file");
        for (let i = 0; i < fileInputs.length; i++) {
            //listen for typing events
            fileInputs[i].addEventListener("input", handleFilesSuggestions);
        }
    };

    return exports();
})();

Object.freeze(window.qBittorrent.pathAutofill);
