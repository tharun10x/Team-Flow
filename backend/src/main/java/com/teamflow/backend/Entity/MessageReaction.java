package com.teamflow.backend.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "message_reactions", uniqueConstraints = {
	@UniqueConstraint(columnNames = {"message_id","user_id","emoji"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageReaction {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

@jakarta.persistence.Column(nullable = false)
	private String emoji;

	@ManyToOne
	@JoinColumn(name = "message_id", nullable = false)
	private Message message;

	@ManyToOne
	@JoinColumn(name = "user_id", nullable = false)
	private User user;
}
