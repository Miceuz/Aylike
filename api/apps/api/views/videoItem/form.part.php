<?php
Part::input($form, 'ModelForm');
Part::input($title, 'string');
?>
<?php $form->begin(); ?>
	<fieldset>
		<legend><?php echo $title ?></legend>
		<?php $form->input('id'); ?>		
				<p>
			<label for="<?php echo $form->facebookId->getName(); ?>">Facebook Id</label><br />
			<?php $form->input('facebookId'); ?>
		</p>
		<p>
			<label for="<?php echo $form->playlistId->getName(); ?>">Playlist Id</label><br />
			<?php $form->input('playlistId'); ?>
		</p>
		<p>
			<label for="<?php echo $form->youtubeId->getName(); ?>">Youtube Id</label><br />
			<?php $form->input('youtubeId'); ?>
		</p>
		<p>
			<label for="<?php echo $form->title->getName(); ?>">Title</label><br />
			<?php $form->input('title'); ?>
		</p>
		<p>
			<label for="<?php echo $form->thumbnailUrl->getName(); ?>">Thumbnail Url</label><br />
			<?php $form->input('thumbnailUrl'); ?>
		</p>
		<p>
			<label for="<?php echo $form->timeAdded->getName(); ?>">Time Added</label><br />
			<?php $form->input('timeAdded'); ?>
		</p>

		<input type="submit" value="Save" />
	</fieldset>
<?php $form->end(); ?>