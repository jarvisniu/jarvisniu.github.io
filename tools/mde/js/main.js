$(document).ready(function() {
	
	editor = {
		
		// Editor variables
		fitHeightElements: $(".full-height"),
		wrappersMargin: $("#left-column > .wrapper:first").outerHeight(true) - $("#left-column > .wrapper:first").height(),
		columns: $("#left-column, #right-column"),
        ace: ace.edit("markdown"),
		markdownSource: $("#markdown"),
		markdownPreview: $("#preview"),
		markdownTargets: $("#html, #preview"),
		markdownTargetsTriggers: $(".buttons-container .switch"),
		topPanels: $("#top_panels_container .top_panel"),
		topPanelsTriggers: $("#left-column .buttons-container .toppanel"),
		quickReferencePreText: $("#quick-reference pre"),
		featuresTriggers: $(".buttons-container .feature"),
		wordCountContainers: $(".word-count"),
		isAutoScrolling: false,
        allowScroll: false,
		isFullscreen: false,
		
		// Initiate editor
		init: function() {
			this.onloadEffect(0);
			this.initBindings();
			this.fitHeight();
			this.restoreState(function() {
				editor.convertMarkdown();
				editor.onloadEffect(1);
			});

            // this.ace.setTheme("ace/theme/solarized_light");
            this.ace.getSession().setMode("ace/mode/markdown");
            this.ace.getSession().setUseWrapMode(true);
            this.ace.renderer.setPrintMarginColumn(false);


		},

		// Handle events on several DOM elements
		initBindings: function() {

			$(window).on("resize", function() {
				editor.fitHeight();
			});

            this.ace.session.on("changeScrollTop", function(e) {
                if (editor.isAutoScrolling) {
                    editor.allowScroll = ! editor.allowScroll;
                    if (editor.allowScroll) editor.syncPreviewScroll();
                }
            });

			$("#preview").on("scroll", function(e) {
			    if (editor.isAutoScrolling) {
                    editor.allowScroll = ! editor.allowScroll;
                    if (editor.allowScroll) editor.syncSourceScroll();
                }
			});

			this.markdownSource.on({
				keydown: function(e) {
					// if (e.keyCode == 9) {
					// 	editor.handleTabKeyPress(e);
					// }
				},
				"keyup change": function() {
					editor.markdownSource.trigger("change.editor");
				},
				"cut paste drop": function() {
					setTimeout(function() {
						editor.markdownSource.trigger("change.editor");
					}, 0);
				},
				"change.editor": function() {
					editor.save("markdown", editor.markdownSource.val());
					editor.convertMarkdown();
				}
			});

			this.markdownTargetsTriggers.on("click", function(e) {
				e.preventDefault();
				editor.switchToPanel($(this).data("switchto"));
			});

			this.topPanelsTriggers.on("click", function(e) {
				e.preventDefault();
				editor.toggleTopPanel($("#"+ $(this).data("toppanel")));
			});

			this.topPanels.children(".close").on("click", function(e) {
				e.preventDefault();
				editor.closeTopPanels();
			});

			this.quickReferencePreText.on("click", function() {
				editor.addToMarkdownSource($(this).text());
			});

			this.featuresTriggers.on("click", function(e) {
				e.preventDefault();
				var t = $(this);
				editor.toggleFeature(t.data("feature"), t.data());
			});

		},

		// Resize some elements to make the editor fit inside the window
		fitHeight: function() {
			var newHeight = $(window).height() - this.wrappersMargin;
			this.fitHeightElements.each(function() {
				var t = $(this);
				if (t.closest("#left-column").length) {
					var thisNewHeight = newHeight - $("#top_panels_container").outerHeight();
				} else {
					var thisNewHeight = newHeight;
				}
				t.css({ height: thisNewHeight +"px" });
			});
		},

		// Save a key/value pair in the app storage (either Markdown text or enabled features)
		save: function(key, value) {
			app.save(key, value);
		},

		// Restore the editor's state
		restoreState: function(c) {
			app.restoreState(function(restoredItems) {
				if (restoredItems.markdown) editor.ace.session.setValue(restoredItems.markdown);
				if (restoredItems.isAutoScrolling == "y") editor.toggleFeature("auto-scroll");
				if (restoredItems.isFullscreen == "y") editor.toggleFeature("fullscreen");
				editor.switchToPanel(restoredItems.activePanel || "preview");

				c();
			});
		},

		// Convert Markdown to HTML using showdown.js
		convertMarkdown: function() {
			var markdown = this.ace.session.getValue(),
				html = marked(markdown);
			document.getElementById("html").value = html;
			app.updateMarkdownPreview(html);
			this.markdownPreview.trigger("updated.editor");
		},

		// Programmatically add Markdown text to the textarea
		// position = { start: Number, end: Number }
		addToMarkdownSource: function(markdown, position) {
			var markdownSourceValue = this.ace.session.getValue();
			if (typeof(position) == "undefined") { // Add text at the end
				var newMarkdownSourceValue =
					(markdownSourceValue.length? markdownSourceValue + "\n\n" : "") +
					markdown;
			} else { // Add text at a given position
				var newMarkdownSourceValue =
					markdownSourceValue.substring(0, position.start) +
					markdown +
					markdownSourceValue.substring(position.end);
			}
			this.ace.session.setValue(newMarkdownSourceValue);
				// .trigger("change.editor")  // TODO
		},

		// Switch between editor panels
		switchToPanel: function(which) {
			var target = $("#"+ which),
				targetTrigger = this.markdownTargetsTriggers.filter("[data-switchto="+ which +"]");
			if (!this.isFullscreen || which != "markdown") this.markdownTargets.not(target).hide();
			target.show();
			this.markdownTargetsTriggers.not(targetTrigger).removeClass("active");
			targetTrigger.addClass("active");
			if (which != "markdown") this.featuresTriggers.filter("[data-feature=fullscreen][data-tofocus]").last().data("tofocus", which);
			if (this.isFullscreen) {
				var columnToShow = (which == "markdown")? this.markdownSource.closest(this.columns) : this.markdownPreview.closest(this.columns);
				columnToShow.show();
				this.columns.not(columnToShow).hide();
			}
			if (this.isAutoScrolling && which == "preview") {
				this.markdownPreview.trigger("updated.editor"); // Auto-scroll on switch since it wasn't possible earlier due to the preview being hidden
			}
			this.save("activePanel", which);
		},

		// Toggle a top panel's visibility
		toggleTopPanel: function(panel) {
			if (panel.is(":visible")) this.closeTopPanels();
				else this.openTopPanel(panel);
		},

		// Open a top panel
		openTopPanel: function(panel) {
			var panelTrigger = this.topPanelsTriggers.filter("[data-toppanel="+ panel.attr("id") +"]");
			panel.show();
			panelTrigger.addClass("active");
			this.topPanels.not(panel).hide();
			this.topPanelsTriggers.not(panelTrigger).removeClass("active");
			this.fitHeight();
			$(document).off("keyup.toppanel").on("keyup.toppanel", function(e) { // Close top panel when the escape key is pressed
				if (e.keyCode == 27) editor.closeTopPanels();
			});
		},

		// Close all top panels
		closeTopPanels: function() {
			this.topPanels.hide();
			this.topPanelsTriggers.removeClass("active");
			this.fitHeight();
			$(document).off("keyup.toppanel");
		},

		// Toggle editor feature
		toggleFeature: function(which, featureData) {
			var featureTrigger = this.featuresTriggers.filter("[data-feature="+ which +"]");
			switch (which) {
				case "auto-scroll":
					this.toggleAutoScroll();
					break;
				case "fullscreen":
					this.toggleFullscreen(featureData);
					break;
			}
			featureTrigger.toggleClass("active");
		},

		toggleAutoScroll: function() {
			if (!this.isAutoScrolling) {
				this.markdownPreview
					.on("updated.editor", function() {
						var markdownPreview = this;
						editor.syncPreviewScroll();
					})
					.trigger("updated.editor");
			} else {
				this.markdownPreview.off("updated.editor");
			}
			this.isAutoScrolling = !this.isAutoScrolling;
			this.save("isAutoScrolling", this.isAutoScrolling? "y" : "n");
		},

		toggleFullscreen: function(featureData) {
			var toFocus = featureData && featureData.tofocus;
			this.isFullscreen = !this.isFullscreen;
			$(document.body).toggleClass("fullscreen");
			if (toFocus) this.switchToPanel(toFocus);
			// Exit fullscreen
			if (!this.isFullscreen) {
				this.columns.show(); // Make sure all columns are visible when exiting fullscreen
				var activeMarkdownTargetsTriggersSwichtoValue = this.markdownTargetsTriggers.filter(".active").first().data("switchto");
				// Force one of the right panel's elements to be active if not already when exiting fullscreen
				if (activeMarkdownTargetsTriggersSwichtoValue == "markdown") {
					this.switchToPanel("preview");
				}
				// Auto-scroll when exiting fullscreen and "preview" is already active since it changes width
				if (this.isAutoScrolling && activeMarkdownTargetsTriggersSwichtoValue == "preview") {
					this.markdownPreview.trigger("updated.editor");
				}
				$(document).off("keyup.fullscreen");
			// Enter fullscreen
			} else {
				this.closeTopPanels();
				$(document).on("keyup.fullscreen", function(e) { // Exit fullscreen when the escape key is pressed
					if (e.keyCode == 27) editor.featuresTriggers.filter("[data-feature=fullscreen]").last().trigger("click");
				});
			}
			this.save("isFullscreen", this.isFullscreen? "y" : "n");
		},

        // Synchronize the scroll position of the source editor - OK
        syncPreviewScroll: function() {
            editor.markdownPreview.scrollTop(
                ( document.getElementById("preview-iframe").scrollHeight - editor.markdownPreview.height() )
                * editor.ace.session.getScrollTop() / 
                ( document.getElementsByClassName("ace_scrollbar-v")[0].scrollHeight - $("#markdown").height())
            );
        },

		// Synchronize the scroll position of the preview panel - OK
		syncSourceScroll: function() {
            editor.ace.session.setScrollTop(
                ( document.getElementsByClassName("ace_scrollbar-v")[0].scrollHeight - $("#markdown").height())
                * editor.markdownPreview.scrollTop() / 
                ( document.getElementById("preview-iframe").scrollHeight - editor.markdownPreview.height() )
            );
		},

		// Subtle fade-in effect
		onloadEffect: function(step) {
			var theBody = $(document.body);
			switch (step) {
				case 0:
					theBody.fadeTo(0, 0);
					break;
				case 1:
					theBody.fadeTo(1000, 1);
					break;
			}
		},

		// Count the words in the Markdown output and update the word count in the corresponding
		// .word-count elements in the editor
		updateWordCount: function(text) {
			var wordCount = "";

			if (text.length) {
				wordCount = text.trim().replace(/\s+/gi, " ").split(" ").length;
				wordCount = wordCount.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",") +" words"; // Format number (add commas and unit)
			}

			this.wordCountContainers.text(wordCount);
		}
		
	};
	
});