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

    const exports = () => {
        return {
            attachPathAutofill: attachPathAutofill
        };
    };

    function showInputSuggestions(inputElement, names) {
        const datalist = document.createElement("datalist");
        datalist.id = inputElement.id + "Suggestions";
        for (const name of names) {
            const option = document.createElement("option");
            option.value = name;
            datalist.appendChild(option);
        }

        let oldDatalist = document.getElementById(inputElement.id + "Suggestions");
        if (oldDatalist !== null)
            oldDatalist.remove();

        inputElement.list = datalist.id;
        inputElement.appendChild(datalist);
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
        fetch(filesListRequest)
            .then(response => response.text())
            .then(text => { JSON.parse(text) })
            .then(filesList => { showInputSuggestions(element, filesList) });
    }

    // get all input text fields with class pathDirectory class="pathDirectory"
    function attachPathAutofill() {
        const directoryInputs = document.getElementsByClassName("pathDirectory");
        for (const input of directoryInputs)
            input.addEventListener("input", () => {showPathSuggestions(this, "dirs");});
        const fileInputs = document.getElementsByClassName("pathFile");
        for (let i = 0; i < fileInputs.length; i++) {
            //listen for typing events
            fileInputs[i].addEventListener("input", () => {showPathSuggestions(this, "all");});
        }
    };

    return exports();
})();

Object.freeze(window.qBittorrent.pathAutofill);
