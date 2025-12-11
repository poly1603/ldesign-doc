<template>
  <div class="not-found">
    <div class="not-found-content">
      <!-- 动画图标 -->
      <div class="not-found-illustration">
        <div class="not-found-robot">
          <!-- 机器人头部 -->
          <div class="robot-head">
            <div class="robot-face">
              <div class="robot-eye left">
                <div class="robot-pupil"></div>
              </div>
              <div class="robot-eye right">
                <div class="robot-pupil"></div>
              </div>
            </div>
            <div class="robot-antenna">
              <div class="robot-antenna-ball"></div>
            </div>
          </div>
          <!-- 闪烁的问号 -->
          <div class="robot-question">?</div>
        </div>
      </div>
      <p class="not-found-code">404</p>
      <h1 class="not-found-title">页面未找到</h1>
      <p class="not-found-description">
        抱歉，您访问的页面不存在或已被移动。
      </p>
      <div class="not-found-actions">
        <router-link to="/" class="not-found-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          返回首页
        </router-link>
        <button @click="goBack" class="not-found-button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          返回上一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from '@ldesign/doc/client'

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--ldoc-nav-height, 64px) - 100px);
  padding: 48px 24px;
  text-align: center;
  /* 居中显示，不受侧边栏影响 */
  margin: 0 auto;
  max-width: 100%;
}

.not-found-content {
  max-width: 400px;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 动画机器人 */
.not-found-illustration {
  margin-bottom: 32px;
}

.not-found-robot {
  position: relative;
  display: inline-block;
}

.robot-head {
  position: relative;
  width: 120px;
  height: 100px;
  background: linear-gradient(135deg, var(--ldoc-c-brand-soft), var(--ldoc-c-bg-soft));
  border-radius: 24px;
  border: 3px solid var(--ldoc-c-brand);
  animation: headBob 2s ease-in-out infinite;
}

@keyframes headBob {

  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  25% {
    transform: translateY(-5px) rotate(-2deg);
  }

  75% {
    transform: translateY(-5px) rotate(2deg);
  }
}

.robot-face {
  display: flex;
  justify-content: center;
  gap: 24px;
  padding-top: 28px;
}

.robot-eye {
  width: 24px;
  height: 24px;
  background: var(--ldoc-c-bg);
  border-radius: 50%;
  border: 2px solid var(--ldoc-c-brand);
  position: relative;
  overflow: hidden;
}

.robot-pupil {
  position: absolute;
  width: 10px;
  height: 10px;
  background: var(--ldoc-c-brand);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: lookAround 3s ease-in-out infinite;
}

@keyframes lookAround {

  0%,
  100% {
    transform: translate(-50%, -50%);
  }

  25% {
    transform: translate(-80%, -80%);
  }

  50% {
    transform: translate(-20%, -50%);
  }

  75% {
    transform: translate(-80%, -20%);
  }
}

.robot-antenna {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 20px;
  background: var(--ldoc-c-brand);
  border-radius: 2px;
}

.robot-antenna-ball {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 14px;
  height: 14px;
  background: var(--ldoc-c-brand);
  border-radius: 50%;
  animation: antennaPulse 1.5s ease-in-out infinite;
}

@keyframes antennaPulse {

  0%,
  100% {
    box-shadow: 0 0 0 0 var(--ldoc-c-brand-soft);
    transform: translateX(-50%) scale(1);
  }

  50% {
    box-shadow: 0 0 20px 8px var(--ldoc-c-brand-soft);
    transform: translateX(-50%) scale(1.1);
  }
}

.robot-question {
  position: absolute;
  top: -15px;
  right: -25px;
  font-size: 32px;
  font-weight: 800;
  color: var(--ldoc-c-brand);
  animation: questionBounce 1s ease-in-out infinite;
}

@keyframes questionBounce {

  0%,
  100% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }

  50% {
    transform: translateY(-8px) rotate(10deg);
    opacity: 0.7;
  }
}

.not-found-code {
  font-size: 80px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--ldoc-c-brand), var(--ldoc-c-brand-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  line-height: 1;
  letter-spacing: -2px;
}

.not-found-title {
  font-size: 22px;
  font-weight: 600;
  margin: 20px 0 12px;
  color: var(--ldoc-c-text-1);
}

.not-found-description {
  font-size: 15px;
  color: var(--ldoc-c-text-2);
  margin: 0 0 36px;
  line-height: 1.6;
}

.not-found-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.not-found-link,
.not-found-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
}

.not-found-link {
  background: var(--ldoc-c-brand);
  color: white;
  border: 1px solid var(--ldoc-c-brand);
}

.not-found-link:hover {
  background: var(--ldoc-c-brand-dark);
  border-color: var(--ldoc-c-brand-dark);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(var(--ldoc-c-brand-rgb), 0.35);
}

.not-found-button {
  background: var(--ldoc-c-bg);
  color: var(--ldoc-c-text-1);
  border: 1px solid var(--ldoc-c-divider);
}

.not-found-button:hover {
  border-color: var(--ldoc-c-brand);
  color: var(--ldoc-c-brand);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

/* 暗色模式优化 */
.dark .robot-head {
  background: linear-gradient(135deg, var(--ldoc-c-brand-soft), var(--ldoc-c-bg-mute));
}

.dark .not-found-button:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}
</style>
