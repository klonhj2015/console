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

import React from 'react'
import classnames from 'classnames'
import { observer } from 'mobx-react'
import { get } from 'lodash'
import { Icon, Loading, Tooltip } from '@pitrix/lego-ui'

import { Status, Button } from 'components/Base'
import { getLocalTime, parseUrl, formatSize } from 'utils'

import styles from './index.scss'

@observer
export default class ImageBuilderLastRun extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showLog: false,
    }
    this.LogContent = React.createRef()
    this.store = props.store
  }

  componentWillUnmount() {
    clearTimeout(this.refreshTimer)
  }

  toggleShowLog = () => {
    const { showLog } = this.state
    if (!showLog) {
      this.getLog()
    } else {
      clearTimeout(this.refreshTimer)
    }
    this.setState({ showLog: !showLog })
  }

  getLog = async () => {
    const { logURL, status } = this.props.runDetail
    const { logData } = this.store
    const isRunning = status === 'Building' || status === 'Unknown'
    clearTimeout(this.refreshTimer)

    if (!logURL) {
      this.refreshTimer = setTimeout(this.getLog, 4000)
      return
    }
    if (globals.app.hasKSModule('logging')) {
      await this.store.getLog(logURL)
    } else {
      await this.store.fetchPodsLogs(logURL)
    }
    this.handleScrollToBottom()
    if (logData.hasMore) {
      this.getLog()
      return
    }
    if (isRunning) {
      this.refreshTimer = setTimeout(this.getLog, 4000)
    }
  }

  handleScrollToBottom = () => {
    const LogContent = this.LogContent.current
    if (LogContent) {
      LogContent.scrollTop = LogContent.scrollHeight
    }
  }

  showLog = () => {
    this.setState({ showLog: true })
  }

  stopPropagation = e => {
    e && e.stopPropagation()
  }

  handleDownload = () => {
    const { sourceUrl } = this.props.runDetail
    const path = get(parseUrl(sourceUrl), 'pathname', `/${sourceUrl}`)
    const downLoadUrl = `${window.location.protocol}//${
      window.location.host
    }/b2i_download${path}`
    window.open(downLoadUrl)
  }

  renderLog = () => {
    const { log, isLoading } = this.store.logData
    if (!this.state.showLog) {
      return null
    }

    if (isLoading) {
      return (
        <div className={styles.logContent} onClick={this.stopPropagation}>
          <Loading />
        </div>
      )
    }

    return (
      <div className={styles.logContent} onClick={this.stopPropagation}>
        <pre ref={this.LogContent}>{log || t('Log is loading...')}</pre>
      </div>
    )
  }

  renderDetailInfo = () => {
    const { imageName, branch, binaryName, binarySize } = this.props.runDetail

    if (!this.props.isB2i) {
      return (
        <span className={styles.branchName}>
          <Icon name="branch" />
          <span>{branch || 'master'}</span>
        </span>
      )
    }

    const content = (
      <div className={styles.artifactContent}>
        <p className={styles.title}>{'制品文件'}</p>
        <div className={styles.info}>
          <Icon name="file" />
          <p>
            {binaryName} <span>{formatSize(binarySize)}</span>
          </p>
        </div>
        <div className={styles.info}>
          <Icon name="templet" />
          <p>{imageName}</p>
        </div>
        <Button onClick={this.handleDownload} type="primary">
          {t('Download Artifact')}
        </Button>
      </div>
    )

    return (
      <Tooltip className={styles.tooltip} content={content} trigger="hover">
        <Icon name="file" />
      </Tooltip>
    )
  }

  render() {
    const { count, status, imageName, startTime, name } = this.props.runDetail
    const { loading } = this.props

    if (loading) {
      return null
    }

    return (
      <ul
        className={classnames(styles.item, {
          [styles.active]: this.state.showLog,
        })}
        onClick={this.toggleShowLog}
      >
        <li>
          <div className={styles.value}>
            #{count} {this.renderDetailInfo()}
          </div>
          <div className={styles.label}>{t('Build Times')}</div>
        </li>
        <li>
          <div className={styles.value}>
            <Status
              className={styles.status}
              type={status}
              name={t(t(status))}
              flicker
            />
          </div>
          <div className={styles.label}>{t('Status')}</div>
        </li>
        <li>
          <div className={styles.value}>{imageName}</div>
          <div className={styles.label}>{t('ImageName')}</div>
        </li>
        <li>
          <div className={styles.value}>
            {getLocalTime(startTime).format('YYYY-MM-DD HH:mm:ss')}
          </div>
          <div className={styles.label}>{t('StartTime')}</div>
        </li>
        <li>
          <div className={styles.value}>
            {t(`${t('Image')}: ${name} ${t(`S2I_${status}`)}`)}
          </div>
          <div className={styles.label}>{t('Last Message')}</div>
        </li>
        <Icon className={styles.icon} name="chevron-down" />
        {this.renderLog()}
      </ul>
    )
  }
}
