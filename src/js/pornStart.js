import React    from 'react';
import ReactDOM from 'react-dom';

import PornStart from './pornStart.jsx';

let pornStart = <PornStart
	source='earthporn'
	backgroundSize='cover'
	showHUD={true}
	trimTitle={true} />;

ReactDOM.render(pornStart, document.getElementById('pornStart'));

