<div
    x-data="{
        popoverOpen: false,
        popoverArrow: true,
        popoverPosition: 'bottom',
        popoverHeight: 0,
        popoverOffset: 8,
        popoverHeightCalculate() {
            this.$refs.popover.classList.add('invisible');
            this.popoverOpen=true;
            let that=this;
            $nextTick(function(){
                that.popoverHeight = that.$refs.popover.offsetHeight;
                that.popoverOpen=false;
                that.$refs.popover.classList.remove('invisible');
                that.$refs.popoverInner.setAttribute('x-transition', '');
                that.popoverPositionCalculate();
            });
        },
        popoverPositionCalculate() {
            if (window.innerHeight < (this.$refs.popoverButton.getBoundingClientRect().top + this.$refs.popoverButton.offsetHeight + this.popoverOffset + this.popoverHeight)) {
                this.popoverPosition = 'top';
            } else {
                this.popoverPosition = 'bottom';
            }

            const rightmost = this.$refs.popover.getBoundingClientRect().right + this.$refs.popover.offsetWidth;
            const estimatedRightmost = this.$refs.popoverButton.getBoundingClientRect().right + 150;

            if (estimatedRightmost > window.innerWidth) {
                this.popoverPosition = 'left';
            }
        }
    }"
    x-init="
        that = this;
        window.addEventListener('resize', function(){
            popoverPositionCalculate();
        });
        $watch('popoverOpen', function(value){
            if(value){ popoverPositionCalculate(); }
        });
    "
    class="relative"
>
    <button type="button" x-ref="popoverButton" @click="popoverOpen=!popoverOpen" :class="{ 'bg-gray-700 text-white border-transparent': popoverOpen, 'bg-white dark:bg-gray-800 dark:border-gray-700 border-gray-300': !popoverOpen }" class="flex items-center justify-center w-8 h-8 border  rounded cursor-pointer hover:bg-gray-700 hover:text-white hover:border-transparent dark:hover:bg-gray-700 dark:hover:brightness-110">
        {{ $icon }}
    </button>

    <div
        x-ref="popover"
        x-show="popoverOpen"
        x-init="setTimeout(function(){ popoverHeightCalculate(); }, 100);"
        x-trap.inert="popoverOpen"
        @click.away="popoverOpen=false;"
        @keydown.escape.window="popoverOpen=false"
        :class="{
            'top-0 mt-10' : popoverPosition == 'bottom',
            'bottom-0 mb-10' : popoverPosition == 'top',
            '-left-[160px] -translate-y-[calc(50%+0.5rem)]' : popoverPosition == 'left',
        }"
        class="absolute w-[300px] max-w-lg -translate-x-1/2 left-1/2 z-10"
        x-cloak
    >
        <x-layout.card x-ref="popoverInner" x-show="popoverOpen" class="w-full p-4">
            <div x-show="popoverArrow && popoverPosition == 'bottom'" class="absolute top-0 inline-block w-5 mt-px overflow-hidden -translate-x-2 -translate-y-2.5 left-1/2"><div class="w-2.5 h-2.5 origin-bottom-left transform rotate-45 bg-white dark:bg-gray-800 dark:border-gray-700 border-t border-l rounded-sm"></div></div>
            <div x-show="popoverArrow  && popoverPosition == 'top'" class="absolute bottom-0 inline-block w-5 mb-px overflow-hidden -translate-x-2 translate-y-2.5 left-1/2"><div class="w-2.5 h-2.5 origin-top-left transform -rotate-45 bg-white dark:bg-gray-800 dark:border-gray-700 border-b border-l rounded-sm"></div></div>
            <div x-show="popoverArrow  && popoverPosition == 'left'" class="absolute right-0 inline-block h-5 mr-px translate-x-2 -translate-y-2 top-1/2"><div class="w-2.5 h-2.5 origin-top-right transform rotate-45 bg-white dark:bg-gray-800 dark:border-gray-700 border-t border-r rounded-sm"></div></div>

            <div class="flex items-start justify-between mb-4">
                <strong class="text-lg">
                    {{ $title }}
                </strong>

                {{ $action ?? '' }}
            </div>

            {{ $slot }}
        </x-layout.card>
    </div>
</div>
