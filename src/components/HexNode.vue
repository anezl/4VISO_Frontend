<template>
  <div 
    class="node-wrapper"
    draggable="true"
    @dragstart="onDragStart"
    @dragover.prevent
    @drop="onDrop"
  >
    
    <!-- MAIN -->
    <div 
      class="hex"
      :class="{ dragging: isDragging }"
      @dblclick="editNode"
    >
      {{ node.label }}
    </div>

    <!-- BACKUP -->
    <div
      v-if="node.backup"
      class="hex backup"
      @click="$emit('swapBackup')"
    >
      {{ node.backup }}
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  node: Object,
  index: Number
})

const emit = defineEmits(['dragStart', 'dropNode', 'update', 'swapBackup'])

const isDragging = ref(false)

const onDragStart = (e) => {
  isDragging.value = true
  e.dataTransfer.setData('index', props.index)
  emit('dragStart', props.index)
}

const onDrop = (e) => {
  const fromIndex = e.dataTransfer.getData('index')
  emit('dropNode', { from: Number(fromIndex), to: props.index })
  isDragging.value = false
}

const editNode = () => {
  const name = prompt("Edit node", props.node.label)
  if (name) emit('update', name)
}
</script>

<style scoped>
.node-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

/* HEX */
.hex {
  width: 110px;
  height: 110px;
  background: #3498db;
  clip-path: polygon(
    25% 5%, 75% 5%,
    100% 50%, 75% 95%,
    25% 95%, 0% 50%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: grab;
  text-align: center;
  padding: 5px;
  transition: transform 0.2s;
}

.hex:active {
  cursor: grabbing;
}

.dragging {
  opacity: 0.5;
  transform: scale(1.1);
}

/* BACKUP */
.backup {
  background: gray;
  font-size: 12px;
}
</style>