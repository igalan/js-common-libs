/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * JS Common Libs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with JS Common Libs. If not, see <http://www.gnu.org/licenses/>.
 */

function TrackData(id, args) {
	this.id = id;
	if (args != null){
		if(args.adapter != null){
			this.adapter = args.adapter;
//			console.log(this.adapter);
		}
		if(args.gzip != null){
			this.gzip = args.gzip;
		}
	}
};

TrackData.prototype.retrieveData = function(region){
	this.adapter.getData(region);
};

TrackData.prototype.setFilters = function(filters){
	this.adapter.setFilters(filters);
};
TrackData.prototype.setOption = function(option, value){
	this.adapter.setOption(option, value);
};
