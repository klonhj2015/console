/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2019 The KubeSphere Console Authors.
 *
 * KubeSphere Console is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * KubeSphere Console is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with KubeSphere Console.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { isEmpty } from 'lodash'

import LogStore from 'stores/logging/query'
import LogCard from 'components/Cards/LogQuery'

@observer
class LogCollectionDetailContainers extends Component {
  store = new LogStore({
    from: 0,
    size: 100,
    log_query: '',
  })

  render() {
    const detail = this.props.detailStore || {}
    const isCollecting = detail.enable

    return isEmpty(detail) ? null : (
      <LogCard store={this.store} realTime={isCollecting} />
    )
  }
}

export default LogCollectionDetailContainers
