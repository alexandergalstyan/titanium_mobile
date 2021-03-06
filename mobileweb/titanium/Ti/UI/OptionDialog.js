define(["Ti/_/declare", "Ti/_/Evented", "Ti/Locale", "Ti/UI", "Ti/_/css"], function(declare, Evented, Locale, UI, css) {

	var undef;

	return declare("Ti.UI.OptionDialog", Evented, {

		show: function() {
			// Create the window and a background to dim the current view
			var optionsWindow = this._optionsWindow = UI.createWindow();
			var dimmingView = UI.createView({
				backgroundColor: "black",
				opacity: 0,
				left: 0,
				top: 0,
				right: 0,
				bottom: 0
			});
			optionsWindow.add(dimmingView);
			
			// Create the options dialog itself
			var optionsDialog = UI.createView({
				width: "100%",
				height: UI.SIZE,
				bottom: 0,
				backgroundColor: "white",
				layout: "vertical",
				opacity: 0
			});
			optionsWindow.add(optionsDialog);
			
			// Add the title
			optionsDialog.add(UI.createLabel({
				text: this.title,
				font: {fontWeight: "bold"},
				left: 5,
				right: 5,
				top: 5,
				height: UI.SIZE,
				textAlign: UI.TEXT_ALIGNMENT_CENTER
			}));
			
			var self = this;
			function addButton(title, index, bottom) {
				var button = UI.createButton({
					left: 5,
					right: 5,
					top: 5,
					bottom: bottom,
					height: UI.SIZE,
					title: title,
					index: index
				});
				if (index === self.destructive) {
					css.add(button.domNode, "TiUIElementGradientDestructive");
				} else if (index === self.cancel) {
					css.add(button.domNode, "TiUIElementGradientCancel");
				}
				optionsDialog.add(button);
				button.addEventListener("singletap",function(){
					optionsWindow.close();
					self._optionsWindow = undef;
					self.fireEvent("click",{
						index: index,
						cancel: self.cancel,
						destructive: self.destructive
					});
				});
			}
			
			// Add the buttons
			var options = this.options,
				i = 0;
			if (require.is(options,"Array")) {
				for (; i < options.length; i++) {
					addButton(options[i], i, i === options.length - 1 ? 5 : 0);
				}
			}
			
			// Show the options dialog
			optionsWindow.open();
			
			// Animate the background after waiting for the first layout to occur
			setTimeout(function(){
				optionsDialog.animate({
					bottom: -optionsDialog._measuredHeight,
					opacity: 1,
					duration: 0
				});
				dimmingView.animate({
					opacity: 0.5,
					duration: 150
				}, function(){
					setTimeout(function(){
						optionsDialog.animate({
							bottom: 0,
							duration: 150
						});
					},0);
				});
			},30);
		},
		
		properties: {
			
			cancel: -1,
			
			destructive: -1,
			
			options: undef,
			
			title: "",
			
			titleid: {
				set: function(value) {
					this.title = Locale.getString(value);
					return value;
				}
			}
		}

	});

});
